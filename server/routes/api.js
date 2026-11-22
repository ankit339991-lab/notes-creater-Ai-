/**
 * API Routes
 * Endpoints for TubeNotes AI:
 * - POST /api/generate-notes: Initiates note generation
 * - GET  /api/tasks/:id: Polls generation progress
 * - GET  /api/notes/:id: Retrieves generated notes
 * - GET  /api/notes: Lists all saved notes (history)
 * - DELETE /api/notes/:id: Deletes a note
 * - GET  /api/health: System health check
 */

import { Router } from 'express';
import { randomUUID } from 'crypto';
import { isValidYouTubeUrl, fetchVideoMetadata } from '../services/youtubeService.js';
import { runFullPipeline } from '../services/aiService.js';
import {
  createTask,
  updateTask,
  getTask,
  saveNotes,
  getNotes,
  getAllNotes,
  deleteNotes
} from '../services/storageService.js';

const router = Router();

/**
 * POST /api/generate-notes
 * Initiates the study notes generation pipeline for a YouTube video URL.
 * 
 * Body: { url: string, style?: string, detailLevel?: string }
 */
router.post('/generate-notes', async (req, res) => {
  try {
    const { url, language = 'auto', style = 'detailed', detailLevel = 'comprehensive' } = req.body || {};

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid YouTube video URL.'
      });
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL. Please provide a standard watch, shorts, or youtu.be link.'
      });
    }

    // Generate unique task ID
    const taskId = `task_${randomUUID().substring(0, 8)}`;
    const task = createTask(taskId, { url, language, style, detailLevel });

    // Asynchronously kick off the pipeline in background
    (async () => {
      try {
        updateTask(taskId, {
          status: 'processing',
          currentStep: 1,
          stepName: 'Fetching video metadata and audio tracks...',
          progress: 15
        });

        // 1. Fetch metadata (oEmbed with fallback)
        const videoMetadata = await fetchVideoMetadata(url);

        // 2. Run full AI pipeline (STT -> OCR -> LLM Synthesis) with language & detail options
        const generatedNotes = await runFullPipeline(
          videoMetadata,
          (step, total, stepName, progress) => {
            updateTask(taskId, {
              currentStep: step,
              totalSteps: total,
              stepName,
              progress
            });
          },
          { language, style, detailLevel }
        );

        // 3. Save generated notes to storage
        await saveNotes(generatedNotes);

        // 4. Mark task as completed
        updateTask(taskId, {
          status: 'completed',
          currentStep: 4,
          progress: 100,
          stepName: 'Complete! Notes ready.',
          notesId: generatedNotes.id
        });
      } catch (err) {
        console.error(`Task ${taskId} failed:`, err);
        updateTask(taskId, {
          status: 'failed',
          error: err.message || 'An error occurred during AI processing.'
        });
      }
    })();

    return res.status(202).json({
      success: true,
      message: 'Notes generation initiated successfully.',
      taskId: task.id,
      status: task.status,
      checkStatusUrl: `/api/tasks/${task.id}`
    });
  } catch (error) {
    console.error('Error in /api/generate-notes:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while starting note generation.'
    });
  }
});

/**
 * GET /api/tasks/:id
 * Polls the current status and progress percentage of a generation task.
 */
router.get('/tasks/:id', (req, res) => {
  const task = getTask(req.params.id);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found.'
    });
  }

  return res.json({
    success: true,
    task: {
      id: task.id,
      status: task.status,
      currentStep: task.currentStep,
      totalSteps: task.totalSteps,
      stepName: task.stepName,
      progress: task.progress,
      notesId: task.notesId,
      error: task.error,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }
  });
});

/**
 * GET /api/notes/:id
 * Fetches the complete generated study notes for display.
 */
router.get('/notes/:id', (req, res) => {
  const note = getNotes(req.params.id);
  if (!note) {
    return res.status(404).json({
      success: false,
      error: 'Notes not found.'
    });
  }

  return res.json({
    success: true,
    note
  });
});

/**
 * GET /api/notes
 * Fetches all saved study notes (for dashboard history/recents).
 */
router.get('/notes', (req, res) => {
  const notes = getAllNotes();
  return res.json({
    success: true,
    count: notes.length,
    notes: notes.map((n) => ({
      id: n.id,
      videoId: n.videoId,
      videoUrl: n.videoUrl,
      title: n.videoMetadata?.title || 'Untitled Lecture',
      authorName: n.videoMetadata?.authorName || 'Unknown Speaker',
      thumbnailUrl: n.videoMetadata?.thumbnailUrl || '',
      summary: n.summary?.substring(0, 160) + '...',
      generatedAt: n.generatedAt
    }))
  });
});

/**
 * DELETE /api/notes/:id
 * Deletes a note from storage.
 */
router.delete('/notes/:id', async (req, res) => {
  const deleted = await deleteNotes(req.params.id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Notes not found or already deleted.'
    });
  }

  return res.json({
    success: true,
    message: 'Notes deleted successfully.'
  });
});

/**
 * GET /api/health
 * Health check endpoint.
 */
router.get('/health', (req, res) => {
  const hasKey = Boolean(process.env.OPENROUTER_API_KEY);
  return res.json({
    status: 'ok',
    service: 'TubeNotes AI API',
    aiProvider: hasKey ? 'OpenRouter AI' : 'Mock Mode',
    model: process.env.OPENROUTER_MODEL || 'openrouter/free',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

export default router;

