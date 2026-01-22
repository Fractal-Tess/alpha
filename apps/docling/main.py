"""Lucid Docling Service - Document text extraction microservice."""

from fastapi import FastAPI, UploadFile, HTTPException
from docling.document_converter import DocumentConverter
from pydantic import BaseModel
import tempfile
import os

app = FastAPI(title="Lucid Docling Service")
converter = DocumentConverter()

# Maximum file size: 20MB
MAX_FILE_SIZE = 20 * 1024 * 1024

# Allowed MIME types
ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

# MIME type to file extension mapping
SUFFIX_MAP = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}


class Section(BaseModel):
    """A section extracted from a document."""

    type: str
    text: str


class ExtractionResult(BaseModel):
    """Result of document text extraction."""

    text: str
    metadata: dict
    sections: list[Section]


def get_suffix(content_type: str) -> str:
    """Get file suffix from content type."""
    return SUFFIX_MAP.get(content_type, "")


def extract_sections(document) -> list[Section]:
    """Extract document structure for better AI processing."""
    sections = []
    for item in document.iterate_items():
        if hasattr(item, "text"):
            sections.append(
                Section(
                    type=item.__class__.__name__,
                    text=item.text[:1000],  # Limit section size
                )
            )
    return sections


@app.post("/extract", response_model=ExtractionResult)
async def extract_document(file: UploadFile):
    """Extract text and structure from uploaded document."""
    # Validate file size
    if file.size is not None and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, detail="File too large. Maximum size is 20MB."
        )

    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed types: PDF, DOC, DOCX.",
        )

    # Create temp file with appropriate suffix
    suffix = get_suffix(file.content_type)
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()

        # Double-check size after reading (in case size wasn't provided)
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, detail="File too large. Maximum size is 20MB."
            )

        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Convert document
        result = converter.convert(tmp_path)

        # Extract text and metadata
        extracted_text = result.document.export_to_text()
        metadata = result.document.metadata.dict() if result.document.metadata else {}
        sections = extract_sections(result.document)

        return ExtractionResult(
            text=extracted_text,
            metadata=metadata,
            sections=sections,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(e)}",
        )
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}
