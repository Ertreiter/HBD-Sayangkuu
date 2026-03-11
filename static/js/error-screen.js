/**
 * error-screen.js — Fake "Critical Error" interstitial screen
 * Shown after all 5 hubs are unlocked, before the Birthday Surprise.
 */

'use strict';

const ErrorScreen = (() => {
  const overlay    = document.getElementById('error-overlay');
  const scanBtn    = document.getElementById('error-scan-btn');
  const ignoreBtn  = document.getElementById('error-ignore-btn');
  const bugBtn     = document.getElementById('error-bug-btn');
  const scanPopup  = document.getElementById('error-scan-popup');
  const scanAnim   = scanPopup.querySelector('.scan-anim');
  const scanResult = document.getElementById('scan-result');
  const scanOkBtn  = document.getElementById('scan-ok-btn');
  const bugToast   = document.getElementById('error-bug-toast');

  let onProceed = () => {};

  // ── Show / Hide ───────────────────────────────────────────────────
  function show(onProceedCb) {
    onProceed = onProceedCb;
    overlay.classList.remove('hidden');
    // reset popup state each time
    scanPopup.classList.add('hidden');
    scanAnim.style.display = '';
    scanResult.classList.add('hidden');
    bugToast.classList.add('hidden');
  }

  function hide() {
    overlay.classList.add('hidden');
  }

  // ── Scan Error button ─────────────────────────────────────────────
  scanBtn.addEventListener('click', () => {
    scanPopup.classList.remove('hidden');
    scanAnim.style.display = 'block';
    scanResult.classList.add('hidden');

    // Simulate scanning for 2 seconds, then reveal the result
    setTimeout(() => {
      scanAnim.style.display = 'none';
      scanResult.classList.remove('hidden');
    }, 2000);
  });

  // ── "Continue" from scan result → go to surprise ─────────────────
  scanOkBtn.addEventListener('click', () => {
    hide();
    onProceed();
  });

  // ── "Ignore" button → also proceeds (she can't escape love 💖) ────
  ignoreBtn.addEventListener('click', () => {
    hide();
    onProceed();
  });

  // ── Bug Report button → funny toast ──────────────────────────────
  let toastTimeout = null;
  bugBtn.addEventListener('click', () => {
    bugToast.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      bugToast.classList.add('hidden');
    }, 4000);
  });

  return { show, hide };
})();
