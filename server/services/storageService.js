/**
 * Storage Service
 * Manages in-memory task tracking for asynchronous progress polling
 * and local persistence for generated study notes (in JSON format).
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOPIC_TEMPLATES } from '../mock/knowledgeBase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, '../../data/notes_db.json');

// In-memory task tracker: taskId -> { id, status, currentStep, stepName, progress, notesId, error, createdAt }
const activeTasks = new Map();

// In-memory notes cache: notesId -> noteObject
const notesStore = new Map();

/**
 * Initializes the storage system and loads pre-seeded notes.
 */
export async function initStorage() {
  try {
    const fileExists = await fs.access(DB_FILE_PATH).then(() => true).catch(() => false);
    if (fileExists) {
      const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        parsed.forEach((note) => {
          if (note && note.id) {
            notesStore.set(note.id, note);
          }
        });
        // console.log(`Loaded ${notesStore.size} saved notes from storage.`);
        return;
      }
    }
  } catch (err) {
    console.warn('Could not read existing notes_db.json, seeding defaults:', err.message);
  }

  // Pre-seed with sample notes for immediate testing
  seedDefaultNotes();
  await persistNotesToDisk();
}

/**
 * Pre-seeds default study notes
 */
function seedDefaultNotes() {
  const seedItems = [
    {
      id: "note_sample_cs",
      videoId: "dQw4w9WgXcQ",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      generatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      videoMetadata: {
        title: "MIT 6.006: Introduction to Algorithms & Asymptotic Sorting",
        authorName: "MIT OpenCourseWare",
        videoId: "dQw4w9WgXcQ",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
        duration: "48m 10s"
      },
      summary: TOPIC_TEMPLATES.computer_science.summary,
      keyConcepts: TOPIC_TEMPLATES.computer_science.keyConcepts,
      notesMarkdown: TOPIC_TEMPLATES.computer_science.markdownContent,
      flashcards: TOPIC_TEMPLATES.computer_science.flashcards,
      transcript: TOPIC_TEMPLATES.computer_science.transcriptSample,
      visionData: TOPIC_TEMPLATES.computer_science.visionOcrSample
    },
    {
      id: "note_sample_ml",
      videoId: "aircAruvnKk",
      videoUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
      generatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      videoMetadata: {
        title: "Stanford CS229: Deep Learning, Backpropagation & Optimizers",
        authorName: "Stanford Online",
        videoId: "aircAruvnKk",
        url: "https://www.youtube.com/watch?v=aircAruvnKk",
        thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
        duration: "1h 14m"
      },
      summary: TOPIC_TEMPLATES.machine_learning.summary,
      keyConcepts: TOPIC_TEMPLATES.machine_learning.keyConcepts,
      notesMarkdown: TOPIC_TEMPLATES.machine_learning.markdownContent,
      flashcards: TOPIC_TEMPLATES.machine_learning.flashcards,
      transcript: TOPIC_TEMPLATES.machine_learning.transcriptSample,
      visionData: TOPIC_TEMPLATES.machine_learning.visionOcrSample
    }
  ];

  seedItems.forEach((n) => notesStore.set(n.id, n));
}

/**
 * Persists all in-memory notes to disk
 */
async function persistNotesToDisk() {
  try {
    const list = Array.from(notesStore.values());
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist notes to disk:', err.message);
  }
}

// -----------------------------------------------------------------------------
// TASK MANAGEMENT
// -----------------------------------------------------------------------------

export function createTask(taskId, meta = {}) {
  const task = {
    id: taskId,
    status: 'pending', // 'pending' | 'processing' | 'completed' | 'failed'
    currentStep: 0,
    totalSteps: 4,
    stepName: 'Queued for processing...',
    progress: 5,
    notesId: null,
    error: null,
    createdAt: new Date().toISOString(),
    ...meta
  };
  activeTasks.set(taskId, task);
  return task;
}

export function updateTask(taskId, updates = {}) {
  const task = activeTasks.get(taskId);
  if (!task) return null;
  const updated = { ...task, ...updates, updatedAt: new Date().toISOString() };
  activeTasks.set(taskId, updated);
  return updated;
}

export function getTask(taskId) {
  return activeTasks.get(taskId) || null;
}

// -----------------------------------------------------------------------------
// NOTES MANAGEMENT
// -----------------------------------------------------------------------------

export async function saveNotes(notesData) {
  notesStore.set(notesData.id, notesData);
  await persistNotesToDisk();
  return notesData;
}

export function getNotes(notesId) {
  return notesStore.get(notesId) || null;
}

export function getAllNotes() {
  return Array.from(notesStore.values()).sort(
    (a, b) => new Date(b.generatedAt || 0) - new Date(a.generatedAt || 0)
  );
}

export async function deleteNotes(notesId) {
  const existed = notesStore.delete(notesId);
  if (existed) {
    await persistNotesToDisk();
  }
  return existed;
}

