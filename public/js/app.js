/**
 * TubeNotes AI - Main Application Controller
 */

import { Api } from './api.js';
import { NotesRenderer } from './notesRenderer.js';
import { FlashcardDeck } from './flashcards.js';

// Application State
const state = {
  currentNote: null,
  activeTaskId: null,
  pollTimer: null,
  elapsedTimer: null,
  startTime: null,
  allNotesHistory: [],
  theme: localStorage.getItem('tubenotes_theme') || 'light'
};

// Flashcards deck instance
const flashcardDeck = new FlashcardDeck('flashcards-container');

// Motivational Study Tips displayed during generation
const STUDY_TIPS = [
  "💡 Spaced repetition can boost long-term retention by over 200%.",
  "💡 The Feynman Technique: if you can't explain it simply, you don't understand it yet.",
  "💡 Teaching concepts to a peer or rubber duck cements neural pathways.",
  "💡 Interleaving different topics during a study session improves problem-solving agility.",
  "💡 Active retrieval creates stronger synaptic connections than passive reading."
];

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLucideIcons();
  bindUIEvents();
  loadNotesHistory();

  // Check URL parameters (e.g. ?note=note_id)
  const urlParams = new URLSearchParams(window.location.search);
  const noteParam = urlParams.get('note');
  if (noteParam) {
    loadNoteById(noteParam);
  }
});

/**
 * Initializes Theme (Light/Dark)
 */
function initTheme() {
  if (state.theme === 'dark' || (!('tubenotes_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    state.theme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    state.theme = 'light';
  }
  updateThemeIcon();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('tubenotes_theme', state.theme);
  if (state.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;
  themeBtn.innerHTML = state.theme === 'dark'
    ? `<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`
    : `<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
}

function initLucideIcons() {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}

/**
 * Toast Notification Helper
 */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900';

  toast.className = `flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/**
 * Event Listeners Binding
 */
function bindUIEvents() {
  // Theme toggle
  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

  // Generate Notes Form
  const form = document.getElementById('generate-form');
  form?.addEventListener('submit', handleFormSubmit);

  // Quick Sample Links
  document.querySelectorAll('.sample-url-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      const input = document.getElementById('youtube-url-input');
      if (input && url) {
        input.value = url;
        input.focus();
        showToast('Sample YouTube link loaded!', 'info');
      }
    });
  });

  // Paste from clipboard button
  document.getElementById('paste-btn')?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      const input = document.getElementById('youtube-url-input');
      if (input && text) {
        input.value = text.trim();
        showToast('URL pasted from clipboard', 'info');
      }
    } catch {
      showToast('Clipboard permission needed to paste', 'error');
    }
  });

  // History Drawer Toggles
  document.getElementById('history-open-btn')?.addEventListener('click', openHistoryDrawer);
  document.getElementById('history-close-btn')?.addEventListener('click', closeHistoryDrawer);
  document.getElementById('history-backdrop')?.addEventListener('click', closeHistoryDrawer);
  document.getElementById('history-search-input')?.addEventListener('input', filterHistoryList);

  // Back to Dashboard button
  document.getElementById('back-to-dashboard-btn')?.addEventListener('click', showDashboardView);

  // Notes Viewer Tabs
  document.querySelectorAll('.viewer-tab-btn').forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      const tabId = tabBtn.getAttribute('data-tab');
      switchNotesTab(tabId);
    });
  });

  // Export Buttons
  document.getElementById('export-markdown-btn')?.addEventListener('click', exportAsMarkdown);
  document.getElementById('export-text-btn')?.addEventListener('click', exportAsText);
  document.getElementById('export-pdf-btn')?.addEventListener('click', exportAsPdf);
  document.getElementById('copy-notes-btn')?.addEventListener('click', copyNotesToClipboard);

  // Keyboard shortcut for flashcard flip (Space bar)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.getElementById('tab-flashcards')?.classList.contains('hidden') === false) {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        flashcardDeck.flip();
      }
    }
  });
}

/**
 * Handles Form Submission for Generating Notes
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('youtube-url-input');
  const language = document.getElementById('language-select')?.value || 'auto';
  const detailLevel = document.getElementById('detail-select')?.value || 'comprehensive';
  const url = input?.value?.trim();

  if (!url) {
    showToast('Please enter a YouTube video URL.', 'error');
    input?.focus();
    return;
  }

  try {
    // Show Progress Modal
    openProgressModal();

    // Call API with language and detail options
    const response = await Api.generateNotes(url, { language, detailLevel });
    state.activeTaskId = response.taskId;

    // Start polling status
    startTaskPolling(response.taskId);
  } catch (error) {
    closeProgressModal();
    showToast(error.message || 'Error starting generation.', 'error');
  }
}

/**
 * Task Polling Controller
 */
function startTaskPolling(taskId) {
  if (state.pollTimer) clearInterval(state.pollTimer);
  if (state.elapsedTimer) clearInterval(state.elapsedTimer);

  state.startTime = Date.now();
  updateElapsedCounter();
  state.elapsedTimer = setInterval(updateElapsedCounter, 1000);

  // Cycle tips
  let tipIndex = 0;
  const tipEl = document.getElementById('progress-tip-text');
  const tipInterval = setInterval(() => {
    tipIndex = (tipIndex + 1) % STUDY_TIPS.length;
    if (tipEl) tipEl.textContent = STUDY_TIPS[tipIndex];
  }, 3500);

  // Poll loop
  state.pollTimer = setInterval(async () => {
    try {
      const task = await Api.checkTaskStatus(taskId);
      updateProgressUI(task);

      if (task.status === 'completed') {
        clearInterval(state.pollTimer);
        clearInterval(state.elapsedTimer);
        clearInterval(tipInterval);

        // Confetti celebration
        if (window.confetti) {
          window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        }

        setTimeout(async () => {
          closeProgressModal();
          await loadNoteById(task.notesId);
          await loadNotesHistory();
          showToast('Study notes generated successfully!', 'success');
        }, 600);
      } else if (task.status === 'failed') {
        clearInterval(state.pollTimer);
        clearInterval(state.elapsedTimer);
        clearInterval(tipInterval);
        closeProgressModal();
        showToast(task.error || 'Failed to generate study notes.', 'error');
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, 600);
}

function updateElapsedCounter() {
  const elapsedEl = document.getElementById('progress-elapsed-timer');
  if (!elapsedEl || !state.startTime) return;
  const seconds = Math.floor((Date.now() - state.startTime) / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  elapsedEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Updates the 4-step progress indicators in the modal
 */
function updateProgressUI(task) {
  const progressBar = document.getElementById('progress-bar-fill');
  const progressPercentText = document.getElementById('progress-percent-text');
  const progressStatusMessage = document.getElementById('progress-status-message');

  const currentStep = task.currentStep || 1;
  const progress = task.progress || 10;

  if (progressBar) progressBar.style.width = `${progress}%`;
  if (progressPercentText) progressPercentText.textContent = `${progress}%`;
  if (progressStatusMessage) progressStatusMessage.textContent = task.stepName || 'Processing video content...';

  // Update step cards (1 to 4)
  for (let s = 1; s <= 4; s++) {
    const stepEl = document.getElementById(`step-indicator-${s}`);
    const badgeEl = document.getElementById(`step-badge-${s}`);
    if (!stepEl || !badgeEl) continue;

    if (s < currentStep || task.status === 'completed') {
      // Completed step
      stepEl.className = 'flex items-center gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 transition-all';
      badgeEl.innerHTML = `<svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`;
    } else if (s === currentStep) {
      // Active step
      stepEl.className = 'flex items-center gap-3 p-3 rounded-xl border border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 shadow-sm transition-all animate-pulse';
      badgeEl.innerHTML = `<svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`;
    } else {
      // Pending step
      stepEl.className = 'flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 dark:text-gray-500 transition-all';
      badgeEl.innerHTML = `<span class="text-xs font-semibold">${s}</span>`;
    }
  }
}

function openProgressModal() {
  const modal = document.getElementById('progress-modal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function closeProgressModal() {
  const modal = document.getElementById('progress-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

/**
 * Loads a note by ID and switches view to Notes Viewer
 */
export async function loadNoteById(noteId) {
  try {
    const note = await Api.getNotes(noteId);
    state.currentNote = note;
    renderNoteViewer(note);
    showNotesView();

    // Update browser URL query parameter without page reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('note', noteId);
    window.history.pushState({}, '', newUrl);
  } catch (error) {
    showToast('Failed to load note: ' + error.message, 'error');
  }
}

/**
 * Renders the complete Notes Viewer Layout
 */
function renderNoteViewer(note) {
  // 1. Video Banner
  const titleEl = document.getElementById('viewer-video-title');
  const channelEl = document.getElementById('viewer-channel-name');
  const durationEl = document.getElementById('viewer-duration');
  const ytLink = document.getElementById('viewer-yt-link');

  if (titleEl) titleEl.textContent = note.videoMetadata?.title || 'Study Notes';
  if (channelEl) channelEl.textContent = note.videoMetadata?.authorName || 'Instructor';
  if (durationEl) durationEl.textContent = note.videoMetadata?.duration || 'Full Lecture';
  if (ytLink) ytLink.href = note.videoUrl || `https://www.youtube.com/watch?v=${note.videoId}`;

  // 2. Embedded YouTube Player
  const playerFrame = document.getElementById('youtube-iframe');
  if (playerFrame && note.videoId) {
    playerFrame.src = `https://www.youtube.com/embed/${note.videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
  }

  // 3. Executive Summary
  const summaryEl = document.getElementById('viewer-executive-summary');
  if (summaryEl) summaryEl.textContent = note.summary || 'Summary not provided.';

  // 4. Key Concepts
  const conceptsContainer = document.getElementById('viewer-key-concepts-container');
  NotesRenderer.renderKeyConcepts(note.keyConcepts, conceptsContainer);

  // 5. Main Markdown Notes with interactive timestamps
  const notesContainer = document.getElementById('viewer-markdown-content');
  NotesRenderer.render(note.notesMarkdown, notesContainer, (seconds) => {
    seekYouTubePlayer(seconds);
  });

  // 6. Flashcards Deck
  flashcardDeck.setCards(note.flashcards || []);

  // 7. Pipeline Inspector
  const pipelineContainer = document.getElementById('viewer-pipeline-container');
  NotesRenderer.renderPipelineInspector(
    { transcript: note.transcript, visionData: note.visionData },
    pipelineContainer,
    (seconds) => seekYouTubePlayer(seconds)
  );

  // Default to first tab (Structured Notes)
  switchNotesTab('tab-notes');
}

/**
 * Seeks the embedded YouTube iframe to the specified second
 */
function seekYouTubePlayer(seconds) {
  const iframe = document.getElementById('youtube-iframe');
  if (!iframe || !iframe.contentWindow) return;

  try {
    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func: 'seekTo',
        args: [seconds, true]
      }),
      '*'
    );
    showToast(`Jumped video to ${formatSeconds(seconds)}`, 'info');
  } catch (err) {
    console.warn('Could not seek YouTube iframe:', err);
  }
}

function formatSeconds(totalSecs) {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Tab Switching in Notes Viewer
 */
function switchNotesTab(tabId) {
  // Hide all tab panes
  document.querySelectorAll('.tab-pane').forEach((pane) => pane.classList.add('hidden'));

  // Show selected pane
  const activePane = document.getElementById(tabId);
  if (activePane) activePane.classList.remove('hidden');

  // Update tab button styles
  document.querySelectorAll('.viewer-tab-btn').forEach((btn) => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.className = 'viewer-tab-btn px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-sm transition-all flex items-center gap-1.5';
    } else {
      btn.className = 'viewer-tab-btn px-4 py-2 text-xs font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5';
    }
  });

  // Re-render math if opening notes or concepts tab
  if (tabId === 'tab-notes' && window.renderMathInElement) {
    const el = document.getElementById('viewer-markdown-content');
    if (el) {
      try {
        window.renderMathInElement(el, { delimiters: [{ left: '$', right: '$', display: false }], throwOnError: false });
      } catch {}
    }
  }
}

/**
 * View Transitions: Dashboard vs Notes Viewer
 */
function showDashboardView() {
  document.getElementById('landing-dashboard-section')?.classList.remove('hidden');
  document.getElementById('notes-viewer-section')?.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Clear query parameter
  const newUrl = new URL(window.location);
  newUrl.searchParams.delete('note');
  window.history.pushState({}, '', newUrl);
}

function showNotesView() {
  document.getElementById('landing-dashboard-section')?.classList.add('hidden');
  document.getElementById('notes-viewer-section')?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Notes History Management
 */
async function loadNotesHistory() {
  try {
    const list = await Api.listAllNotes();
    state.allNotesHistory = list;
    renderHistoryDrawer(list);
  } catch (err) {
    console.warn('Failed to load notes history:', err);
  }
}

function renderHistoryDrawer(list) {
  const container = document.getElementById('history-items-container');
  const countBadge = document.getElementById('history-count-badge');
  if (countBadge) countBadge.textContent = list.length;
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-gray-400">
        <p class="text-sm">No saved notes yet.</p>
        <p class="text-xs mt-1">Generate your first notes using any YouTube video!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((item) => `
    <div class="group p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer shadow-sm relative" data-note-id="${item.id}">
      <div class="flex items-start gap-3">
        <img src="${item.thumbnailUrl || 'https://img.youtube.com/vi/' + item.videoId + '/hqdefault.jpg'}" alt="Thumbnail" class="w-20 h-14 object-cover rounded-lg shrink-0 border border-gray-100 dark:border-gray-700 bg-gray-100" />
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 transition-colors">${item.title}</h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">${item.authorName}</p>
          <div class="flex items-center justify-between mt-2 text-[10px] text-gray-400">
            <span>${new Date(item.generatedAt).toLocaleDateString()}</span>
            <button type="button" class="delete-note-btn text-rose-500 hover:text-rose-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity" data-id="${item.id}" title="Delete Note">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Bind clicks
  container.querySelectorAll('[data-note-id]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.delete-note-btn')) return;
      const noteId = card.getAttribute('data-note-id');
      closeHistoryDrawer();
      loadNoteById(noteId);
    });
  });

  container.querySelectorAll('.delete-note-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const noteId = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete these study notes?')) {
        try {
          await Api.deleteNote(noteId);
          await loadNotesHistory();
          showToast('Note deleted.', 'info');
        } catch (err) {
          showToast('Failed to delete note.', 'error');
        }
      }
    });
  });
}

function filterHistoryList(e) {
  const query = e.target.value.toLowerCase().trim();
  const filtered = state.allNotesHistory.filter(
    (n) => n.title?.toLowerCase().includes(query) || n.authorName?.toLowerCase().includes(query)
  );
  renderHistoryDrawer(filtered);
}

function openHistoryDrawer() {
  document.getElementById('history-drawer')?.classList.remove('translate-x-full');
  document.getElementById('history-backdrop')?.classList.remove('hidden');
}

function closeHistoryDrawer() {
  document.getElementById('history-drawer')?.classList.add('translate-x-full');
  document.getElementById('history-backdrop')?.classList.add('hidden');
}

/**
 * Export Helpers
 */
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportAsMarkdown() {
  if (!state.currentNote) return;
  const n = state.currentNote;
  let md = `# ${n.videoMetadata?.title || 'Study Notes'}\n\n`;
  md += `**Source Video:** ${n.videoUrl}\n`;
  md += `**Instructor / Channel:** ${n.videoMetadata?.authorName || 'N/A'}\n`;
  md += `**Generated By:** TubeNotes AI\n\n`;
  md += `## Executive Summary\n${n.summary}\n\n`;
  md += `## Key Concepts & Glossary\n`;
  (n.keyConcepts || []).forEach((c) => {
    md += `- **${c.term}**: ${c.definition}\n`;
  });
  md += `\n---\n\n`;
  md += n.notesMarkdown;

  const filename = `${sanitizeFilename(n.videoMetadata?.title || 'study_notes')}.md`;
  downloadFile(md, filename, 'text/markdown;charset=utf-8');
  showToast(`Downloaded ${filename}`, 'success');
}

function exportAsText() {
  if (!state.currentNote) return;
  const n = state.currentNote;
  let txt = `=================================================================\n`;
  txt += `${n.videoMetadata?.title || 'STUDY NOTES'}\n`;
  txt += `Source: ${n.videoUrl}\n`;
  txt += `Instructor: ${n.videoMetadata?.authorName || 'N/A'}\n`;
  txt += `=================================================================\n\n`;
  txt += `EXECUTIVE SUMMARY:\n${n.summary}\n\n`;
  txt += `KEY CONCEPTS:\n`;
  (n.keyConcepts || []).forEach((c) => {
    txt += `* ${c.term}: ${c.definition}\n`;
  });
  txt += `\nDETAILED NOTES:\n`;
  txt += n.notesMarkdown.replace(/[#*`]/g, '');

  const filename = `${sanitizeFilename(n.videoMetadata?.title || 'study_notes')}.txt`;
  downloadFile(txt, filename, 'text/plain;charset=utf-8');
  showToast(`Downloaded ${filename}`, 'success');
}

function exportAsPdf() {
  window.print();
}

async function copyNotesToClipboard() {
  if (!state.currentNote) return;
  try {
    const md = state.currentNote.notesMarkdown;
    await navigator.clipboard.writeText(md);
    showToast('Notes copied to clipboard!', 'success');
  } catch {
    showToast('Failed to copy to clipboard.', 'error');
  }
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
}

