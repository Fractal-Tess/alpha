# Document Processing Flow

```
1. User uploads document (PDF/DOC/DOCX, max 20MB)
   └── Convex stores file in _storage
   └── Creates document record (status: "pending")

2. Convex Workflow: processDocument
   └── Calls Docling HTTP service
   └── Docling extracts text + structure
   └── Returns extracted content
   └── Updates document (status: "ready", extractedText: ...)

3. User requests content generation
   └── Convex Workflow: generateContent
   └── LLM Router classifies complexity
   └── Routes to appropriate model
   └── Generates flashcards/quizzes/summaries
   └── Stores in respective tables

4. User studies
   └── SM-2 algorithm tracks progress
   └── Spaced repetition scheduling
   └── Session stats recorded
```
