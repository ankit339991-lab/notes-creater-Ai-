# 🎓 TubeNotes AI

A full-stack AI web application designed for students and educators that automatically transforms YouTube lectures, tutorials, and marathon educational videos into structured study notes, blackboard formulas, code blocks, and interactive active recall flashcards.

---

## 🌟 Key Features

- **🌐 Multilingual & Same-Language Synthesis**:
  - Automatically matches the lecture's spoken language (**Hinglish**, **Hindi**, **English**, etc.) without forcing unnecessary English translations.
  - Manual language selector: *Auto-Detect*, *Hinglish*, *Hindi*, *English*.
- **📝 Blackboard & Slides Notes Extraction**:
  - Step-by-step mathematical proofs and equations rendered using **KaTeX** ($...$ and $$...$$).
  - Programming code blocks with syntax highlighting and 1-click **Copy Code** buttons.
  - Teacher exam tips and critical warnings highlighted.
- **⏳ Long Video Support (1 to 3+ Hours)**:
  - Fetches complete transcripts across the entire lecture duration.
  - Chronological timeline compression ensures every section from start to finish is captured.
- **⏱️ Synchronized Interactive Video Player**:
  - Embedded YouTube player jumps to the exact second when clicking any timestamp chip (e.g. `▶ 04:12`).
- **🃏 Active Recall Flashcards**:
  - Interactive 3D flip card deck for test preparation (`Space` or click to flip).
- **📥 Multi-Format Export**:
  - Export as Markdown (`.md`)
  - Export as Plain Text (`.txt`)
  - Print / Save as PDF
  - Copy to Clipboard
- **📁 Saved Notes History**:
  - Slide-out history drawer to access, search, and manage previously generated notes.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Marked.js, KaTeX, Prism.js, Canvas Confetti.
- **Backend**: Node.js, Express.js (REST API, task queue, status polling).
- **AI Engine**: OpenRouter AI API (`openrouter/free` / `gemini-2.0-flash` / `llama-3.3-70b`).
- **Subtitles & Transcription**: YouTube TimedText API with graceful fallbacks.

```
study-notes-maker/
├── server/
│   ├── server.js              # Server entry point
│   ├── app.js                 # Express middleware & client delivery
│   ├── routes/
│   │   └── api.js             # Endpoints (/api/generate-notes, /api/tasks/:id, /api/notes/:id)
│   ├── services/
│   │   ├── aiService.js       # AI pipeline (STT, Board OCR, OpenRouter synthesis)
│   │   ├── youtubeService.js  # Robust YouTube URL parser & oEmbed metadata
│   │   └── storageService.js  # Task queue & JSON persistence
│   └── mock/
│       └── knowledgeBase.js   # Fallback templates (Algorithms, ML, Math, Study Science)
├── public/                    # Frontend UI
│   ├── index.html             # Main dashboard, progress modal & notes viewer
│   ├── css/
│   │   └── style.css          # Glassmorphism, 3D flip cards, print stylesheet
│   └── js/
│       ├── app.js             # Main state controller & export handlers
│       ├── api.js             # Client API service with status polling
│       ├── notesRenderer.js   # Markdown, KaTeX & timestamp chips parser
│       └── flashcards.js      # 3D interactive flashcards deck
├── data/
│   └── notes_db.json          # Saved notes database
├── tests/
│   ├── api.test.js            # Unit tests
│   └── integration.test.js    # End-to-end integration tests
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Clone the repository
```bash
git clone https://github.com/ankit339991-lab/notes-creater-Ai-.git
cd notes-creater-Ai-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your **OpenRouter API Key** in `.env`:
```env
PORT=5000
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openrouter/free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### 4. Start the Application
```bash
# Production mode
npm start

# Development mode with hot-reload
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5000
```

### 5. Run Automated Tests
```bash
npm test
```

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/generate-notes` | Accepts `{ url, language, detailLevel }`, initiates generation task |
| `GET` | `/api/tasks/:id` | Polls real-time step progress (`currentStep: 1..4`, `progress: 0..100%`) |
| `GET` | `/api/notes/:id` | Retrieves complete study note object |
| `GET` | `/api/notes` | Lists all saved notes for dashboard history |
| `DELETE` | `/api/notes/:id` | Deletes a note |
| `GET` | `/api/health` | Service health status |

---

## 🛡️ License
MIT License
