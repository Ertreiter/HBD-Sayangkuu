/**
 * game.js — Central state manager
 * Initialises the game, wires up all modules, handles localStorage.
 */

'use strict';

const Game = (() => {
  const LS_KEY = 'hbd_unlocked_hubs';
  let unlocked = [];

  // ── Load / save state ─────────────────────────────────────────────
  function loadState() {
    try {
      const saved = localStorage.getItem(LS_KEY);
      unlocked = saved ? JSON.parse(saved) : [];
    } catch { unlocked = []; }
  }

  function saveState() {
    localStorage.setItem(LS_KEY, JSON.stringify(unlocked));
  }

  // ── Progress UI ───────────────────────────────────────────────────
  function updateProgress() {
    const n   = unlocked.length;
    const pct = (n / HUBS.length) * 100;
    document.getElementById('progress-bar').style.width  = pct + '%';
    document.getElementById('progress-text').textContent =
      `${n} / ${HUBS.length} memories unlocked`;
  }

  // ── Hub clicked from map ──────────────────────────────────────────
  function onHubClicked(id) {
    const hub = HUBS.find(h => h.id === id);
    if (!hub) return;

    if (unlocked.includes(id)) {
      // Already unlocked — re-show the memory
      MemoryModal.show(hub);
    } else {
      // Show quiz
      QuizModal.show(hub, onAnswerCorrect);
    }
  }

  // ── Correct answer callback ───────────────────────────────────────
  function onAnswerCorrect(hub) {
    if (!unlocked.includes(hub.id)) {
      unlocked.push(hub.id);
      saveState();
      updateProgress();
    }

    // Show the memory reveal
    MemoryModal.show(hub);

    // Check win condition
    if (unlocked.length === HUBS.length) {
      // short delay so she can see the last memory, then show the fake error screen
      winTimeout = setTimeout(() => {
        MemoryModal.hide();
        ErrorScreen.show(() => {
          // Called when she clicks "Continue" or "Ignore" on the error screen
          Surprise.show();
        });
      }, 2200);
    }
  }

  // ── Reset (replay) ────────────────────────────────────────────────
  function reset() {
    unlocked.length = 0;   // mutate in-place so the closure reference stays fresh
    saveState();
    updateProgress();
    // Remove any lingering win-condition delay
    clearTimeout(winTimeout);
  }

  let winTimeout = null;

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    loadState();
    updateProgress();
    MapRenderer.init(onHubClicked, () => unlocked);

    // Reset button → confirmation modal
    const resetBtn        = document.getElementById('reset-btn');
    const resetOverlay    = document.getElementById('reset-overlay');
    const resetCancelBtn  = document.getElementById('reset-cancel-btn');
    const resetConfirmBtn = document.getElementById('reset-confirm-btn');

    resetBtn.addEventListener('click', () => {
      resetOverlay.classList.remove('hidden');
    });
    resetCancelBtn.addEventListener('click', () => {
      resetOverlay.classList.add('hidden');
    });
    resetOverlay.addEventListener('click', e => {
      if (e.target === resetOverlay) resetOverlay.classList.add('hidden');
    });
    resetConfirmBtn.addEventListener('click', () => {
      resetOverlay.classList.add('hidden');
      // hide any open screens
      ['surprise-overlay','error-overlay','quiz-overlay','memory-overlay']
        .forEach(id => document.getElementById(id).classList.add('hidden'));
      ErrorScreen && ErrorScreen.hide && ErrorScreen.hide();
      Surprise.hide && Surprise.hide();
      reset();
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { reset };
})();
