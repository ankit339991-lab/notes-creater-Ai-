/**
 * End-to-End API Integration Test
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../server/app.js';
import { initStorage } from '../server/services/storageService.js';

let server;
let baseUrl;

describe('TubeNotes AI End-to-End Server Integration', () => {
  before(async () => {
    await initStorage();
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(() => {
    if (server) server.close();
  });

  test('GET /api/health returns status ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
  });

  test('POST /api/generate-notes with invalid URL returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/generate-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://not-youtube.com/something' })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.error);
  });

  test('POST /api/generate-notes with valid YouTube URL starts pipeline and returns taskId', async () => {
    const res = await fetch(`${baseUrl}/api/generate-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
    });
    assert.equal(res.status, 202);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.taskId);

    // Poll task status until complete (allow time for live OpenRouter AI)
    let task;
    for (let i = 0; i < 45; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const taskRes = await fetch(`${baseUrl}/api/tasks/${data.taskId}`);
      assert.equal(taskRes.status, 200);
      const taskData = await taskRes.json();
      task = taskData.task;
      if (task.status === 'completed' || task.status === 'failed') break;
    }

    assert.equal(task.status, 'completed');
    assert.ok(task.notesId);

    // Fetch generated notes
    const noteRes = await fetch(`${baseUrl}/api/notes/${task.notesId}`);
    assert.equal(noteRes.status, 200);
    const noteData = await noteRes.json();
    assert.equal(noteData.success, true);
    assert.ok(noteData.note);
    assert.ok(noteData.note.summary);
    assert.ok(noteData.note.notesMarkdown);
    assert.ok(noteData.note.keyConcepts.length > 0);
    assert.ok(noteData.note.flashcards.length > 0);
  });

  test('GET /api/notes returns list of saved notes', async () => {
    const res = await fetch(`${baseUrl}/api/notes`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.notes));
    assert.ok(data.notes.length >= 2); // Seeded + generated notes
  });

  test('GET / serves frontend index.html', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('TubeNotes'));
  });
});

