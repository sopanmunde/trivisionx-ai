"""Security, tenant isolation, validation, and regression tests."""
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from core.config import Settings
from core.exceptions import UploadException
from rag.vectorstores.pinecone_store import make_chunk_ids, user_namespace
from services.email_service import _send_smtp_sync
from services.export_service import _safe_cell, generate_pdf_report
from services.third_party_integrations import publish_to_confluence, send_slack_webhook
from utils.validators import validate_file
from langchain_core.documents import Document


def test_secret_key_validation_production():
    with pytest.raises(ValueError):
        Settings(DEBUG=False, SECRET_KEY="")

    with pytest.raises(ValueError):
        Settings(DEBUG=False, SECRET_KEY="too-short")

    with pytest.raises(ValueError):
        Settings(DEBUG=False, SECRET_KEY="fallback-secret-change-in-production")

    ok = Settings(DEBUG=False, SECRET_KEY="a" * 32)
    assert len(ok.SECRET_KEY) >= 32


def test_validate_file_guards_empty_none_and_disallowed():
    with pytest.raises(UploadException):
        validate_file(None, 100)  # type: ignore[arg-type]

    with pytest.raises(UploadException):
        validate_file("malware.exe", 100)

    validate_file("report.pdf", 1024)


def test_spreadsheet_formula_injection_mitigated():
    assert _safe_cell("=CMD|'/C calc'!A0").startswith("'")
    assert _safe_cell("+1+1").startswith("'")
    assert _safe_cell("-2+3").startswith("'")
    assert _safe_cell("@SUM(A1:A2)").startswith("'")
    assert _safe_cell("Normal title") == "Normal title"


def test_pdf_generation_escapes_xml_and_bold():
    pdf_bytes = generate_pdf_report(
        query="Test <script>alert(1)</script> & **Focus**",
        report_text="- **Item 1** with <tag> & entities\nNormal **bold** text.",
        citations=[{"filename": "doc&1.pdf", "page": 1, "snippet": "A < B & C"}],
    )
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF")


@pytest.mark.asyncio
async def test_confluence_publish_escapes_xhtml_and_closes_lists():
    mock_res = MagicMock()
    mock_res.status_code = 200
    mock_res.json.return_value = {"_links": {"base": "https://example.atlassian.net/wiki", "webui": "/pages/1"}}

    with patch("services.third_party_integrations.validate_public_url", new_callable=AsyncMock, return_value=(True, "")), \
         patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_res) as mock_post:
        res = await publish_to_confluence(
            domain="example.atlassian.net",
            email="bot@example.com",
            api_token="tok",
            space_key="RES",
            query="<script>xss</script>",
            report_text="- First **point**\n- Second point\nNormal **end**",
        )

    assert res["success"] is True
    sent_html = mock_post.call_args.kwargs["json"]["body"]["storage"]["value"]
    assert "<script>" not in sent_html
    assert "&lt;script&gt;xss&lt;/script&gt;" in sent_html
    assert "Setting" not in sent_html
    assert "<ul><li>First <strong>point</strong></li><li>Second point</li></ul>" in sent_html
    assert "<strong>end</strong>" in sent_html


@pytest.mark.asyncio
async def test_slack_webhook_blocks_internal_ssrf():
    res = await send_slack_webhook(
        webhook_url="http://169.254.169.254/latest/meta-data",
        query="q",
        summary="s",
    )
    assert res["success"] is False
    assert "https://" in res["error"] or "Invalid" in res["error"]


def test_smtp_rejects_header_injection():
    assert _send_smtp_sync("victim@example.com\r\nBcc: evil@attacker.com", "Hi", "Body") is False
    assert _send_smtp_sync("", "Hi", "Body") is False


def test_pinecone_namespace_and_deterministic_chunk_ids():
    assert user_namespace("user-abc") == "user:user-abc"
    docs = [Document(page_content="hello", metadata={"user_id": "u1", "filename": "a.pdf", "chunk_index": 0})]
    ids1 = make_chunk_ids(docs, namespace_hint="user:u1")
    ids2 = make_chunk_ids(docs, namespace_hint="user:u1")
    assert ids1 == ids2
    assert ids1[0].startswith("u1:")
