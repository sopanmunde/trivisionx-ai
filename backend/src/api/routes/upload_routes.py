"""Upload routes — PDF/DOCX/TXT ingestion with full pipeline."""
import asyncio
import json
import os
import re
from fastapi import APIRouter, Depends, UploadFile, File, Request, HTTPException
from fastapi.responses import StreamingResponse, Response
from core.security import get_current_user
from core.limiter import limiter
from core.constants import RATE_LIMIT_UPLOAD, MAX_FILE_SIZE_BYTES
from core.exceptions import UploadException
from core.config import settings
from utils.validators import validate_file
from rag.ingestion.pdf_loader import load_pdf
from rag.ingestion.docx_loader import load_docx
from rag.ingestion.text_loader import load_text
from rag.ingestion.embedding_pipeline import run_ingestion_pipeline
from rag.vectorstores.pinecone_store import get_vector_store, add_documents, user_namespace
from database.mongodb.repositories.document_repository import save_document_metadata
from core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

_IMAGE_EXTS = {"png", "jpg", "jpeg", "gif", "webp", "bmp", "tiff", "svg"}
_SHEET_EXTS = {"xlsx", "xls"}
_PRES_EXTS = {"pptx", "ppt"}


async def _read_upload_bounded(file: UploadFile) -> bytes:
    """Validate declared metadata and read UploadFile strictly within MAX_FILE_SIZE_BYTES."""
    filename = file.filename or ""
    # Pre-validate extension before reading potentially large payloads into memory
    validate_file(filename, file.size or 0)

    chunks = []
    total = 0
    chunk_size = 1024 * 1024  # 1 MB
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total += len(chunk)
        if total > MAX_FILE_SIZE_BYTES:
            validate_file(filename, total)
        chunks.append(chunk)

    content = b"".join(chunks)
    validate_file(filename, len(content))
    return content


async def _parse_uploaded_documents(
    content: bytes,
    filename: str,
    ext: str,
    include_image_data_uri: bool = False,
):
    """Parse uploaded file bytes into LangChain Document objects without unsafe binary fallbacks."""
    if ext == "pdf":
        docs = await load_pdf(content, filename)
        total_text = "".join(d.page_content for d in docs).strip()
        if len(total_text) < 100:
            logger.info(
                f"PDF '{filename}' appears to be scanned (extracted text length: {len(total_text)}). Running vision extraction..."
            )
            from agents.langgraph.nodes.vision_extraction_node import extract_scanned_pdf
            docs = await extract_scanned_pdf(content, filename)
        return docs

    if ext == "docx":
        return await load_docx(content, filename)

    if ext in _IMAGE_EXTS:
        from agents.langgraph.nodes.vision_extraction_node import extract_vision_data
        from langchain_core.documents import Document
        import base64

        extracted_content = await extract_vision_data(
            content=content,
            filename=filename,
            file_type=ext,
            extraction_type="auto",
        )
        metadata = {"filename": filename, "source": filename, "file_type": ext, "page": 0}
        if include_image_data_uri:
            metadata["data_uri"] = f"data:image/{ext};base64,{base64.b64encode(content[:4096]).decode()}"
        return [Document(page_content=extracted_content, metadata=metadata)]

    if ext in _SHEET_EXTS:
        try:
            import io
            import openpyxl

            def _read_xlsx():
                wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
                rows = []
                for ws in wb.worksheets:
                    rows.append(f"=== Sheet: {ws.title} ===")
                    for row in ws.iter_rows(values_only=True):
                        rows.append("\t".join(str(c) if c is not None else "" for c in row))
                return "\n".join(rows).encode("utf-8")

            extracted_bytes = await asyncio.to_thread(_read_xlsx)
            return await load_text(extracted_bytes, filename)
        except Exception as xlsx_err:
            raise UploadException(f"Failed to parse Excel spreadsheet '{filename}': {xlsx_err}")

    if ext in _PRES_EXTS:
        try:
            import io
            from pptx import Presentation as PptxPresentation

            def _read_pptx():
                prs = PptxPresentation(io.BytesIO(content))
                slides_text = []
                for i, slide in enumerate(prs.slides, 1):
                    texts = [shape.text for shape in slide.shapes if hasattr(shape, "text") and shape.text]
                    slides_text.append(f"=== Slide {i} ===\n" + "\n".join(texts))
                return "\n".join(slides_text).encode("utf-8")

            extracted_bytes = await asyncio.to_thread(_read_pptx)
            return await load_text(extracted_bytes, filename)
        except Exception as pptx_err:
            raise UploadException(f"Failed to parse PowerPoint presentation '{filename}': {pptx_err}")

    return await load_text(content, filename)


@router.post("/upload")
@limiter.limit(RATE_LIMIT_UPLOAD)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["_id"])
    filename = file.filename or ""
    content = await _read_upload_bounded(file)
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    docs = await _parse_uploaded_documents(content, filename, ext, include_image_data_uri=True)

    vector_store = get_vector_store()
    chunk_count = await run_ingestion_pipeline(
        documents=docs,
        user_id=user_id,
        filename=filename,
        vector_store=vector_store,
        use_semantic_chunking=True,
    )

    await save_document_metadata(
        user_id=user_id,
        filename=filename,
        file_type=ext,
        chunk_count=chunk_count,
        file_bytes=content,
    )

    try:
        from services.workflow_scheduler import trigger_event_workflows
        asyncio.create_task(
            trigger_event_workflows(
                event_type="document_uploaded",
                user_id=user_id,
                payload={"filename": filename, "file_type": ext, "chunks": chunk_count},
            )
        )
    except Exception as e:
        logger.warning(f"Failed to trigger event workflow for upload: {e}")

    return {
        "message": "Document ingested and indexed successfully",
        "filename": filename,
        "chunks": chunk_count,
    }


@router.post("/upload/stream")
@limiter.limit(RATE_LIMIT_UPLOAD)
async def upload_document_stream(
    request: Request,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["_id"])
    filename = file.filename or ""
    content = await _read_upload_bounded(file)
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    async def event_generator():
        try:
            yield f"data: {json.dumps({'stage': 'parsing', 'progress': 10})}\n\n"
            docs = await _parse_uploaded_documents(content, filename, ext, include_image_data_uri=False)

            yield f"data: {json.dumps({'stage': 'chunking', 'progress': 30})}\n\n"
            from rag.ingestion.embedding_pipeline import clean_documents, semantic_chunk, enrich_metadata

            docs = clean_documents(docs)
            chunks = semantic_chunk(docs)
            yield f"data: {json.dumps({'stage': 'embedding', 'progress': 60, 'chunks': len(chunks)})}\n\n"

            chunks = enrich_metadata(chunks, user_id=user_id, filename=filename)

            yield f"data: {json.dumps({'stage': 'indexing', 'progress': 80})}\n\n"
            ns = user_namespace(user_id)
            await asyncio.to_thread(add_documents, chunks, ns)
            chunk_count = len(chunks)

            await save_document_metadata(
                user_id=user_id,
                filename=filename,
                file_type=ext,
                chunk_count=chunk_count,
                file_bytes=content,
            )

            yield f"data: {json.dumps({'stage': 'done', 'progress': 100, 'chunks': chunk_count})}\n\n"

        except UploadException as ue:
            logger.warning(f"Streaming upload validation error: {ue}")
            yield f"data: {json.dumps({'error': str(ue)})}\n\n"
        except Exception as e:
            logger.error(f"Streaming upload failed: {e}", exc_info=True)
            msg = str(e) if settings.DEBUG else "Document processing failed"
            yield f"data: {json.dumps({'error': msg})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("")
async def list_documents(current_user=Depends(get_current_user)):
    from database.mongodb.repositories.document_repository import get_user_documents
    user_id = str(current_user["_id"])
    return await get_user_documents(user_id)


@router.get("/{document_id}/download")
async def download_document(document_id: str, current_user=Depends(get_current_user)):
    from bson.objectid import ObjectId
    from database.mongodb.connection import get_database
    from core.constants import COLLECTION_DOCUMENTS

    if not ObjectId.is_valid(document_id):
        raise HTTPException(status_code=400, detail="Invalid document ID")

    user_id = str(current_user["_id"])
    db = get_database()

    doc = await db[COLLECTION_DOCUMENTS].find_one({
        "_id": ObjectId(document_id),
        "user_id": user_id
    })

    if not doc or "file_bytes" not in doc:
        raise HTTPException(status_code=404, detail="Document file not found")

    raw_filename = doc.get("filename", "document")
    safe_filename = re.sub(r"[^\w.\- ()]", "_", os.path.basename(str(raw_filename))) or "document"
    ext = safe_filename.rsplit(".", 1)[-1].lower() if "." in safe_filename else ""

    media_types = {
        "pdf": "application/pdf",
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "gif": "image/gif",
        "webp": "image/webp",
        "svg": "image/svg+xml",
        "txt": "text/plain",
        "md": "text/plain",
        "csv": "text/csv",
        "json": "application/json",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    media_type = media_types.get(ext, "application/octet-stream")

    return Response(
        content=doc["file_bytes"],
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
            "X-Content-Type-Options": "nosniff",
        }
    )


@router.delete("/{document_id}")
async def delete_document(document_id: str, current_user=Depends(get_current_user)):
    from bson.objectid import ObjectId
    from database.mongodb.connection import get_database
    from core.constants import COLLECTION_DOCUMENTS
    from database.mongodb.repositories.document_repository import delete_document_metadata
    from rag.vectorstores.pinecone_store import delete_by_filename

    if not ObjectId.is_valid(document_id):
        raise HTTPException(status_code=400, detail="Invalid document ID")

    user_id = str(current_user["_id"])
    db = get_database()

    doc = await db[COLLECTION_DOCUMENTS].find_one({
        "_id": ObjectId(document_id),
        "user_id": user_id
    })

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    filename = doc.get("filename")

    db_success = await delete_document_metadata(user_id, document_id)

    pinecone_success = False
    if filename:
        try:
            pinecone_success = await asyncio.to_thread(delete_by_filename, user_id, filename)
        except Exception as pine_err:
            logger.warning(f"Could not delete {filename} from Pinecone: {pine_err}")

    if db_success or pinecone_success:
        return {"message": "Document deleted"}

    raise HTTPException(status_code=404, detail="Document could not be deleted")
