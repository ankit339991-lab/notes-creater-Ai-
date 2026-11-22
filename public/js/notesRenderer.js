/**
 * TubeNotes AI - Notes Renderer
 * Renders Markdown, KaTeX math formulas, clickable timestamp chips,
 * and syntax-highlighted code blocks.
 */

/**
 * Converts a timestamp string (e.g. "02:15", "1:14:30") to seconds
 * @param {string} timeStr 
 * @returns {number}
 */
export function timeStringToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.trim().replace(/[\[\]]/g, '').split(':').map(Number);
  if (parts.length === 2) {
    return (parts[0] * 60) + parts[1];
  } else if (parts.length === 3) {
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  }
  return 0;
}

/**
 * Transforms timestamp patterns in text into interactive clickable buttons
 * e.g., "[04:12]" -> <button class="timestamp-chip" data-time="252">▶ 04:12</button>
 * @param {string} text 
 * @returns {string}
 */
export function injectTimestampChips(text) {
  if (!text) return '';
  return text.replace(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g, (match, timeStr) => {
    const seconds = timeStringToSeconds(timeStr);
    return `<button type="button" class="timestamp-chip" data-time="${seconds}" title="Jump video to ${timeStr}">
      <svg class="w-3 h-3 inline-block" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      <span>${timeStr}</span>
    </button>`;
  });
}

/**
 * Full notes renderer
 */
export const NotesRenderer = {
  /**
   * Renders the markdown content into the target DOM container
   * @param {string} markdown - Raw markdown string
   * @param {HTMLElement} container - DOM container element
   * @param {function} onTimestampClick - Callback when a timestamp is clicked
   */
  render(markdown, container, onTimestampClick = () => {}) {
    if (!container) return;

    // 1. Process markdown with Marked
    let rawHtml = '';
    if (window.marked) {
      window.marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true
      });
      rawHtml = window.marked.parse(markdown);
    } else {
      rawHtml = `<pre>${markdown}</pre>`;
    }

    // 2. Inject timestamp chips
    const enhancedHtml = injectTimestampChips(rawHtml);
    container.innerHTML = enhancedHtml;

    // 3. Render KaTeX Math (if library is loaded)
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(container, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      } catch (err) {
        console.warn('KaTeX rendering notice:', err.message);
      }
    }

    // 4. Highlight Code Blocks with Prism
    if (window.Prism) {
      container.querySelectorAll('pre code').forEach((block) => {
        window.Prism.highlightElement(block);
      });
    }

    // 5. Add Copy Button to code blocks
    container.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.copy-code-btn')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-code-btn absolute top-2 right-2 px-2.5 py-1 text-xs font-medium rounded bg-gray-700/80 hover:bg-gray-600 text-gray-200 transition-colors flex items-center gap-1 shadow-sm';
      btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> <span>Copy</span>`;

      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const codeText = pre.querySelector('code')?.innerText || pre.innerText;
        try {
          await navigator.clipboard.writeText(codeText);
          btn.innerHTML = `<svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span class="text-emerald-400">Copied!</span>`;
          setTimeout(() => {
            btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> <span>Copy</span>`;
          }, 2000);
        } catch {
          btn.textContent = 'Failed';
        }
      });

      pre.style.position = 'relative';
      pre.appendChild(btn);
    });

    // 6. Bind click events on timestamp chips
    container.querySelectorAll('.timestamp-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const seconds = parseInt(chip.getAttribute('data-time'), 10);
        if (!isNaN(seconds)) {
          onTimestampClick(seconds);
        }
      });
    });
  },

  /**
   * Renders the Key Concepts & Definitions list
   * @param {Array<{ term: string, definition: string }>} concepts 
   * @param {HTMLElement} container 
   */
  renderKeyConcepts(concepts = [], container) {
    if (!container) return;
    if (!concepts || concepts.length === 0) {
      container.innerHTML = '<p class="text-sm text-gray-500 italic">No key concepts identified.</p>';
      return;
    }

    container.innerHTML = concepts.map((item, idx) => `
      <div class="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">${idx + 1}</span>
          <h4 class="font-bold text-gray-900 dark:text-gray-100 text-sm">${item.term}</h4>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-7">${item.definition}</p>
      </div>
    `).join('');

    // Re-render math inside key concepts if any formulas exist
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(container, {
          delimiters: [{ left: '$', right: '$', display: false }],
          throwOnError: false
        });
      } catch {}
    }
  },

  /**
   * Renders the AI Pipeline Raw Logs (Speech-to-Text and Vision OCR frames)
   * @param {object} params
   * @param {Array} params.transcript 
   * @param {Array} params.visionData 
   * @param {HTMLElement} container 
   * @param {function} onTimestampClick 
   */
  renderPipelineInspector({ transcript = [], visionData = [] }, container, onTimestampClick = () => {}) {
    if (!container) return;

    let html = `
      <div class="space-y-6">
        <!-- Speech-to-Text Stream -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/50">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Audio Speech-to-Text Transcription Stream (${transcript.length} Segments)
            </h4>
            <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">Whisper/STT Mock</span>
          </div>
          <div class="space-y-2.5 max-h-72 overflow-y-auto pr-2">
            ${transcript.map((seg) => `
              <div class="flex items-start gap-2.5 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs">
                <button type="button" class="timestamp-chip shrink-0 mt-0.5" data-time="${seg.seconds || timeStringToSeconds(seg.timestamp)}">
                  ▶ ${seg.timestamp}
                </button>
                <div class="flex-1">
                  <span class="font-semibold text-indigo-600 dark:text-indigo-400 mr-1">${seg.speaker || 'Speaker'}:</span>
                  <span class="text-gray-700 dark:text-gray-300">${seg.text}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Vision & Board OCR Frames -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/50">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
              Vision Keyframe & Board OCR Observations (${visionData.length} Frames Sampled)
            </h4>
            <span class="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono">Gemini/Vision Mock</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
            ${visionData.map((f) => `
              <div class="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-semibold text-gray-700 dark:text-gray-300">${f.detectedType || 'Visual Frame'}</span>
                    <button type="button" class="timestamp-chip" data-time="${timeStringToSeconds(f.timestamp)}">
                      ▶ ${f.timestamp}
                    </button>
                  </div>
                  <p class="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mt-1 font-mono">${f.text}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Bind timestamps in pipeline inspector
    container.querySelectorAll('.timestamp-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const seconds = parseInt(chip.getAttribute('data-time'), 10);
        if (!isNaN(seconds)) {
          onTimestampClick(seconds);
        }
      });
    });
  }
};

