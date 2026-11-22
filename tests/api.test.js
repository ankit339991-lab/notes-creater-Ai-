/**
 * API Integration and Logic Tests
 * Uses Node.js native test runner
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { extractVideoId, isValidYouTubeUrl } from '../server/services/youtubeService.js';
import { transcribeAudio, analyzeVideoFrames, synthesizeStudyNotes } from '../server/services/aiService.js';
import { createTask, updateTask, getTask, saveNotes, getNotes, initStorage } from '../server/services/storageService.js';

describe('YouTube Service URL Parser', () => {
  test('extracts video ID from standard watch URL', () => {
    const id = extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.equal(id, 'dQw4w9WgXcQ');
  });

  test('extracts video ID from short youtu.be URL', () => {
    const id = extractVideoId('https://youtu.be/dQw4w9WgXcQ');
    assert.equal(id, 'dQw4w9WgXcQ');
  });

  test('extracts video ID from shorts URL', () => {
    const id = extractVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ');
    assert.equal(id, 'dQw4w9WgXcQ');
  });

  test('extracts video ID from live stream URL', () => {
    const id = extractVideoId('https://www.youtube.com/live/dQw4w9WgXcQ');
    assert.equal(id, 'dQw4w9WgXcQ');
  });

  test('extracts video ID from mobile share text', () => {
    const id = extractVideoId('Check out this video: https://youtu.be/dQw4w9WgXcQ?si=abcdef');
    assert.equal(id, 'dQw4w9WgXcQ');
  });

  test('handles URL with additional query parameters in any position', () => {
    const id = extractVideoId('https://www.youtube.com/watch?feature=shared&v=dQw4w9WgXcQ&t=42s');
    assert.equal(id, 'dQw4w9WgXcQ');
  });

  test('rejects invalid URLs', () => {
    assert.equal(isValidYouTubeUrl('https://example.com/not-youtube'), false);
    assert.equal(isValidYouTubeUrl(''), false);
    assert.equal(isValidYouTubeUrl(null), false);
  });
});

describe('AI Service Placeholders', () => {
  const mockMeta = {
    videoId: 'test_12345',
    title: 'Introduction to Neural Networks & Deep Learning',
    authorName: 'Stanford AI Lab',
    url: 'https://www.youtube.com/watch?v=test_12345'
  };

  test('transcribeAudio returns mock transcript with segments', async () => {
    const result = await transcribeAudio(mockMeta);
    assert.ok(result.segments);
    assert.ok(result.segments.length > 0);
    assert.equal(result.videoId, 'test_12345');
    assert.ok(result.provider.includes('Mock'));
  });

  test('analyzeVideoFrames returns mock vision OCR analysis', async () => {
    const result = await analyzeVideoFrames(mockMeta);
    assert.ok(result.frames);
    assert.ok(result.frames.length > 0);
    assert.ok(result.provider.includes('Mock'));
  });

  test('synthesizeStudyNotes creates structured markdown and flashcards', async () => {
    const transcript = await transcribeAudio(mockMeta);
    const visual = await analyzeVideoFrames(mockMeta);
    const notes = await synthesizeStudyNotes({ metadata: mockMeta, transcript, visualNotes: visual });

    assert.ok(notes.summary);
    assert.ok(notes.notesMarkdown);
    assert.ok(notes.keyConcepts && notes.keyConcepts.length > 0);
    assert.ok(notes.flashcards && notes.flashcards.length > 0);
  });
});

describe('Storage & Task Management', () => {
  before(async () => {
    await initStorage();
  });

  test('manages task lifecycle', () => {
    const task = createTask('task_test_999', { url: 'https://youtu.be/sample' });
    assert.equal(task.id, 'task_test_999');
    assert.equal(task.status, 'pending');

    const updated = updateTask('task_test_999', { status: 'completed', progress: 100 });
    assert.equal(updated.status, 'completed');
    assert.equal(updated.progress, 100);

    const fetched = getTask('task_test_999');
    assert.equal(fetched.progress, 100);
  });

  test('stores and retrieves notes', async () => {
    const sample = {
      id: 'note_unit_test',
      videoId: 'sample123',
      videoUrl: 'https://youtu.be/sample123',
      summary: 'Unit test summary',
      notesMarkdown: '# Sample Note',
      generatedAt: new Date().toISOString()
    };
    await saveNotes(sample);
    const retrieved = getNotes('note_unit_test');
    assert.equal(retrieved.summary, 'Unit test summary');
  });
});

