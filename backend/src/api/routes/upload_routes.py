"""Upload routes — PDF/DOCX/TXT ingestion with full pipeline."""
from fastapi import APIRouter, Depends, UploadFile, File
from src.core.security import get_current_user
from src.utils.validators import validate_file
from src.rag.ingestion.pdf_loader import load_pdf
from src.rag.ingestion.docx_loader import load_docx
from src.rag.ingestion.text_loader import load_text
from src.rag.ingestion.embedding_pipeline import run_ingestion_pipeline
from src.rag.vectorstores.pinecone_store import get_vector_store
from src.database.mongodb.repositories.document_repository import save_document_metadata
from src.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["_id"])
    filename = file.filename
    content = await file.read()

    # Validate
    validate_file(filename, len(content))

    # Load based on extension
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext == "pdf":
        docs = await load_pdf(content, filename)
    elif ext == "docx":
        docs = await load_docx(content, filename)
    else:
        docs = await load_text(content, filename)

    # Run ingestion pipeline (chunk → enrich → index)
    vector_store = get_vector_store()
    chunk_count = await run_ingestion_pipeline(
        documents=docs,
        user_id=user_id,
        filename=filename,
        vector_store=vector_store,
        use_semantic_chunking=True,
    )

    # Persist metadata to MongoDB
    await save_document_metadata(
        user_id=user_id,
        filename=filename,
        file_type=ext,
        chunk_count=chunk_count,
    )

    return {
        "message": "Document ingested and indexed successfully",
        "filename": filename,
        "chunks": chunk_count,
    }


@router.get("/")
async def list_documents(current_user=Depends(get_current_user)):
    from src.database.mongodb.repositories.document_repository import get_user_documents
    user_id = str(current_user["_id"])
    return await get_user_documents(user_id)
