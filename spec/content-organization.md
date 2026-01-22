# Content Organization Model

```
User
├── Subject Group: "Fall 2024"
│   ├── Subject: "Calculus 101" 📐
│   │   ├── Folder: "Lectures"
│   │   │   ├── week1-limits.pdf
│   │   │   └── week2-derivatives.pdf
│   │   ├── Folder: "Homework"
│   │   │   └── assignment1.docx
│   │   └── textbook-chapter1.pdf  (no folder)
│   │
│   └── Subject: "Physics 201" ⚛️
│       └── lab-manual.pdf
│
├── Subject Group: "Spring 2025"
│   └── Subject: "Linear Algebra" 📊
│       └── ...
│
└── Subject: "Personal Notes" 📝  (ungrouped)
    └── ...
```

## Key Features

- **Subject Groups**: Organize by semester, year, or any category
- **Subjects**: Individual courses/topics with icons and colors
- **Folders**: Optional nested organization within subjects
- **Ungrouped Subjects**: Subjects can exist without a group
- **Drag & Drop**: Reorder groups, subjects, folders, documents

## File Storage

- **Persistent Storage**: Original files stored in Convex file storage
- **Download Anytime**: Users can download original files (PDF, DOCX, etc.)
- **Extracted Text**: Stored separately for AI processing
- **Storage Limits**: Based on user plan (free vs paid)

## Generations (AI-Generated Content)

Generations live in a special **Generations** folder within each subject, separate from documents.

```
Subject: "Calculus 101" 📐
├── Folder: "Lectures"
│   ├── 📄 week1-limits.pdf
│   └── 📄 week2-derivatives.pdf
│
├── Folder: "Homework"
│   └── 📄 assignment1.docx
│
├── 📄 textbook-chapter1.pdf
│
└── 📁 Generations/                            ← Special folder (auto-created)
    ├── 🎴 Flashcards: Limits & Derivatives    → refs: week1, week2
    ├── 📝 Notes: Week 1-2 Summary             → refs: week1, week2
    ├── 🧠 Quiz: Chapter 1                     → refs: textbook-chapter1
    └── 📚 Study Guide: Midterm Prep           → refs: all files
```

**Key Behavior:**

- Each subject has one "Generations" folder (auto-created on first generation)
- Generations display which source documents they reference
- Clicking a reference navigates to the source document
- Can filter generations by source document

**Generation Types & Editors:**
| Type | Icon | Editor |
|------|------|--------|
| Flashcards | 🎴 | Visual card editor (add/edit/delete/reorder) |
| Quiz | 🧠 | Question list editor |
| Notes | 📝 | Rich text/Markdown editor |
| Summary | 📋 | Text editor |
| Study Guide | 📚 | Structured topic editor |
| Concept Map | 🕸️ | Visual graph editor |

**Generation Features:**

- View, rename, delete like regular files
- Regenerate from source files
- Edit with type-specific editor
- Shows linked source documents as chips/tags
- Filter by type or source document

**Export Formats:**
| Generation Type | Export Options |
|-----------------|----------------|
| Flashcards | Anki (.apkg), CSV, JSON, PDF (printable cards) |
| Quiz | PDF (printable), JSON, Google Forms, Kahoot |
| Notes | Markdown, PDF, HTML, DOCX, Notion |
| Summary | Markdown, PDF, HTML, DOCX |
| Study Guide | PDF, Markdown, Google Docs, Notion |
| Concept Map | PNG, SVG, PDF, JSON (for re-import) |

**Export Features:**

- One-click export button on each generation
- Batch export (multiple generations at once)
- Export entire subject's generations as ZIP
- Maintain formatting and structure in exports
- Anki export preserves SM-2 scheduling data
