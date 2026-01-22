"""Tests for the Docling document extraction service."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
import io

from main import app, get_suffix, MAX_FILE_SIZE, ALLOWED_TYPES


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


class TestHealthEndpoint:
    """Tests for the /health endpoint."""

    def test_health_returns_ok(self, client):
        """Health endpoint should return status ok."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestGetSuffix:
    """Tests for the get_suffix helper function."""

    def test_pdf_suffix(self):
        """PDF content type should return .pdf suffix."""
        assert get_suffix("application/pdf") == ".pdf"

    def test_doc_suffix(self):
        """DOC content type should return .doc suffix."""
        assert get_suffix("application/msword") == ".doc"

    def test_docx_suffix(self):
        """DOCX content type should return .docx suffix."""
        suffix = get_suffix(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        assert suffix == ".docx"

    def test_unknown_type_returns_empty(self):
        """Unknown content type should return empty string."""
        assert get_suffix("text/plain") == ""
        assert get_suffix("application/json") == ""


class TestExtractEndpoint:
    """Tests for the /extract endpoint."""

    def test_rejects_unsupported_file_type(self, client):
        """Should reject files with unsupported content types."""
        file_content = b"some text content"
        response = client.post(
            "/extract",
            files={"file": ("test.txt", io.BytesIO(file_content), "text/plain")},
        )
        assert response.status_code == 400
        assert "Unsupported file type" in response.json()["detail"]

    def test_rejects_oversized_file(self, client):
        """Should reject files larger than 20MB."""
        # Create content slightly larger than max
        file_content = b"x" * (MAX_FILE_SIZE + 1)
        response = client.post(
            "/extract",
            files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")},
        )
        assert response.status_code == 400
        assert "too large" in response.json()["detail"]

    @patch("main.converter")
    def test_successful_pdf_extraction(self, mock_converter, client):
        """Should successfully extract text from PDF."""
        # Mock the document converter
        mock_document = MagicMock()
        mock_document.export_to_text.return_value = "Extracted text content"
        mock_document.metadata = None
        mock_document.iterate_items.return_value = []

        mock_result = MagicMock()
        mock_result.document = mock_document

        mock_converter.convert.return_value = mock_result

        file_content = b"%PDF-1.4 mock pdf content"
        response = client.post(
            "/extract",
            files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["text"] == "Extracted text content"
        assert data["metadata"] == {}
        assert data["sections"] == []

    @patch("main.converter")
    def test_extraction_with_sections(self, mock_converter, client):
        """Should extract sections from document."""
        # Mock document with sections
        mock_item = MagicMock()
        mock_item.__class__.__name__ = "Paragraph"
        mock_item.text = "Section content here"

        mock_document = MagicMock()
        mock_document.export_to_text.return_value = "Full text"
        mock_document.metadata = None
        mock_document.iterate_items.return_value = [mock_item]

        mock_result = MagicMock()
        mock_result.document = mock_document

        mock_converter.convert.return_value = mock_result

        file_content = b"%PDF-1.4 mock pdf"
        response = client.post(
            "/extract",
            files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["sections"]) == 1
        assert data["sections"][0]["type"] == "Paragraph"
        assert data["sections"][0]["text"] == "Section content here"

    @patch("main.converter")
    def test_extraction_with_metadata(self, mock_converter, client):
        """Should include document metadata in response."""
        mock_metadata = MagicMock()
        mock_metadata.dict.return_value = {"title": "Test Doc", "author": "Test Author"}

        mock_document = MagicMock()
        mock_document.export_to_text.return_value = "Text"
        mock_document.metadata = mock_metadata
        mock_document.iterate_items.return_value = []

        mock_result = MagicMock()
        mock_result.document = mock_document

        mock_converter.convert.return_value = mock_result

        file_content = b"%PDF-1.4 mock pdf"
        response = client.post(
            "/extract",
            files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["metadata"]["title"] == "Test Doc"
        assert data["metadata"]["author"] == "Test Author"

    @patch("main.converter")
    def test_handles_conversion_error(self, mock_converter, client):
        """Should return 500 error when conversion fails."""
        mock_converter.convert.side_effect = Exception("Conversion failed")

        file_content = b"%PDF-1.4 mock pdf"
        response = client.post(
            "/extract",
            files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")},
        )

        assert response.status_code == 500
        assert "Failed to process document" in response.json()["detail"]

    @patch("main.converter")
    def test_section_text_truncated_to_1000_chars(self, mock_converter, client):
        """Section text should be truncated to 1000 characters."""
        long_text = "x" * 2000

        mock_item = MagicMock()
        mock_item.__class__.__name__ = "Paragraph"
        mock_item.text = long_text

        mock_document = MagicMock()
        mock_document.export_to_text.return_value = "Text"
        mock_document.metadata = None
        mock_document.iterate_items.return_value = [mock_item]

        mock_result = MagicMock()
        mock_result.document = mock_document

        mock_converter.convert.return_value = mock_result

        file_content = b"%PDF-1.4 mock pdf"
        response = client.post(
            "/extract",
            files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["sections"][0]["text"]) == 1000


class TestAllowedTypes:
    """Tests for file type validation."""

    def test_pdf_is_allowed(self):
        """PDF should be in allowed types."""
        assert "application/pdf" in ALLOWED_TYPES

    def test_doc_is_allowed(self):
        """DOC should be in allowed types."""
        assert "application/msword" in ALLOWED_TYPES

    def test_docx_is_allowed(self):
        """DOCX should be in allowed types."""
        assert (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            in ALLOWED_TYPES
        )

    def test_max_file_size(self):
        """Max file size should be 20MB."""
        assert MAX_FILE_SIZE == 20 * 1024 * 1024
