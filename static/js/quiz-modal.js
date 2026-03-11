/**
 * quiz-modal.js — Quiz modal: show, validate, feedback
 */

'use strict';

const QuizModal = (() => {
  let currentHub = null;
  let onCorrect = () => {};

  const overlay   = document.getElementById('quiz-overlay');
  const modal     = document.getElementById('quiz-modal');
  const emoji     = document.getElementById('quiz-hub-emoji');
  const hubName   = document.getElementById('quiz-hub-name');
  const question  = document.getElementById('quiz-question');
  const input     = document.getElementById('quiz-answer');
  const feedback  = document.getElementById('quiz-feedback');
  const submitBtn = document.getElementById('quiz-submit-btn');
  const cancelBtn = document.getElementById('quiz-cancel-btn');

  function show(hub, onCorrectCb) {
    currentHub = hub;
    onCorrect  = onCorrectCb;
    emoji.textContent    = hub.emoji || '💖';
    hubName.textContent  = hub.name;
    question.textContent = hub.question;
    input.value   = '';
    feedback.textContent = '';
    feedback.className   = 'text-center text-sm mt-2 min-h-5 transition-all font-quicksand';
    overlay.classList.remove('hidden');
    setTimeout(() => input.focus(), 100);
  }

  function hide() {
    overlay.classList.add('hidden');
    currentHub = null;
  }

  function checkAnswer() {
    if (!currentHub) return;
    const given   = input.value.trim().toLowerCase();
    const correct = currentHub.answer.trim().toLowerCase();

    if (!given) {
      setFeedback('Please type an answer first 💭', 'text-rose-400');
      return;
    }

    if (given === correct) {
      setFeedback('That\'s right! ✨ Unlocking memory…', 'text-emerald-400 font-bold');
      submitBtn.disabled = true;
      const hubToUnlock = currentHub;   // capture before hide() nullifies it
      const correctCallback = onCorrect;
      setTimeout(() => {
        hide();
        correctCallback(hubToUnlock);
        submitBtn.disabled = false;
      }, 800);
    } else {
      setFeedback('Not quite, try again 💭', 'text-rose-400');
      modal.classList.add('shake');
      modal.addEventListener('animationend', () => modal.classList.remove('shake'), { once: true });
      input.select();
    }
  }

  function setFeedback(msg, classes) {
    feedback.textContent = msg;
    feedback.className   = `text-center text-sm mt-2 min-h-5 transition-all font-quicksand ${classes}`;
  }

  submitBtn.addEventListener('click', checkAnswer);
  cancelBtn.addEventListener('click',  hide);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(); });

  // close on overlay background click
  overlay.addEventListener('click', e => { if (e.target === overlay) hide(); });

  return { show, hide };
})();
