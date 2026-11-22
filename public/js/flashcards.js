/**
 * TubeNotes AI - Flashcards Study Component
 * Provides an interactive 3D flipping flashcard deck for active recall testing.
 */

export class FlashcardDeck {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.cards = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.masteredIndices = new Set();
  }

  /**
   * Initializes the deck with flashcard objects: [{ question, answer, category }]
   * @param {Array<{ question: string, answer: string, category?: string }>} cards 
   */
  setCards(cards = []) {
    this.cards = cards;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.masteredIndices.clear();
    this.render();
  }

  render() {
    if (!this.container) return;

    if (!this.cards || this.cards.length === 0) {
      this.container.innerHTML = `
        <div class="text-center py-12 text-gray-500">
          <p class="text-sm">No flashcards available for this note.</p>
        </div>
      `;
      return;
    }

    const current = this.cards[this.currentIndex];
    const total = this.cards.length;
    const isMastered = this.masteredIndices.has(this.currentIndex);

    this.container.innerHTML = `
      <div class="max-w-xl mx-auto flex flex-col items-center select-none">
        <!-- Header & Progress -->
        <div class="w-full flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
              ${current.category || 'Concept'}
            </span>
            ${isMastered ? '<span class="text-emerald-500 font-semibold flex items-center gap-1">✓ Mastered</span>' : ''}
          </div>
          <div>Card ${this.currentIndex + 1} of ${total}</div>
        </div>

        <!-- 3D Flippable Card -->
        <div id="flashcard-card-box" class="w-full h-72 cursor-pointer perspective-1000 group">
          <div id="flashcard-inner" class="relative w-full h-full duration-500 transform-style-preserve-3d rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 ${this.isFlipped ? 'rotate-y-180' : ''}">
            
            <!-- FRONT: Question -->
            <div class="absolute inset-0 w-full h-full backface-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">Question</span>
                <span class="text-xs text-gray-400 flex items-center gap-1">Click to flip ↺</span>
              </div>
              <div class="my-auto text-center px-4">
                <h3 class="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 leading-snug">
                  ${current.question}
                </h3>
              </div>
              <div class="text-center text-xs text-gray-400">
                Space or click card to reveal answer
              </div>
            </div>

            <!-- BACK: Answer -->
            <div class="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl p-6 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-xs uppercase tracking-wider font-bold text-indigo-300">Answer</span>
                <span class="text-xs text-indigo-200 flex items-center gap-1">Click to flip ↺</span>
              </div>
              <div class="my-auto text-center px-4">
                <p class="text-base md:text-lg text-indigo-50 leading-relaxed font-medium">
                  ${current.answer}
                </p>
              </div>
              <div class="text-center text-xs text-indigo-300">
                Did you recall this correctly?
              </div>
            </div>

          </div>
        </div>

        <!-- Bottom Controls -->
        <div class="w-full flex items-center justify-between mt-6 gap-3">
          <button id="fc-prev-btn" class="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors shadow-sm disabled:opacity-40" ${this.currentIndex === 0 ? 'disabled' : ''}>
            ← Previous
          </button>

          <div class="flex items-center gap-2">
            <button id="fc-flip-btn" class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm">
              Flip Card (Space)
            </button>
            <button id="fc-master-btn" class="px-3 py-2 rounded-xl text-xs font-semibold ${isMastered ? 'bg-emerald-600 text-white' : 'border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'} transition-colors shadow-sm">
              ${isMastered ? '✓ Mastered' : 'Mark Mastered'}
            </button>
          </div>

          <button id="fc-next-btn" class="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors shadow-sm disabled:opacity-40" ${this.currentIndex === total - 1 ? 'disabled' : ''}>
            Next →
          </button>
        </div>

        <!-- Mastered Counter -->
        <div class="mt-4 text-xs text-gray-400">
          Mastered: <span class="font-bold text-emerald-500">${this.masteredIndices.size}</span> / ${total} concepts
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const cardBox = document.getElementById('flashcard-card-box');
    const flipBtn = document.getElementById('fc-flip-btn');
    const prevBtn = document.getElementById('fc-prev-btn');
    const nextBtn = document.getElementById('fc-next-btn');
    const masterBtn = document.getElementById('fc-master-btn');

    if (cardBox) cardBox.onclick = () => this.flip();
    if (flipBtn) flipBtn.onclick = () => this.flip();
    if (prevBtn) prevBtn.onclick = () => this.prev();
    if (nextBtn) nextBtn.onclick = () => this.next();
    if (masterBtn) masterBtn.onclick = () => this.toggleMastered();
  }

  flip() {
    this.isFlipped = !this.isFlipped;
    const inner = document.getElementById('flashcard-inner');
    if (inner) {
      if (this.isFlipped) {
        inner.classList.add('rotate-y-180');
      } else {
        inner.classList.remove('rotate-y-180');
      }
    }
  }

  next() {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
      this.render();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
      this.render();
    }
  }

  toggleMastered() {
    if (this.masteredIndices.has(this.currentIndex)) {
      this.masteredIndices.delete(this.currentIndex);
    } else {
      this.masteredIndices.add(this.currentIndex);
    }
    this.render();
  }
}

