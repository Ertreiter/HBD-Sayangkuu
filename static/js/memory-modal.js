/**
 * memory-modal.js — Memory reveal modal (photo + heartfelt note)
 */

'use strict';

const MemoryModal = (() => {
  const overlay  = document.getElementById('memory-overlay');
  const emoji    = document.getElementById('memory-hub-emoji');
  const hubName  = document.getElementById('memory-hub-name');
  const photo    = document.getElementById('memory-photo');
  const note     = document.getElementById('memory-note');
  const closeBtn = document.getElementById('memory-close-btn');

  function show(hub) {
    emoji.textContent   = hub.emoji || '💖';
    hubName.textContent = hub.name;
    photo.src           = hub.photo;
    photo.alt           = `Memory: ${hub.name}`;
    note.textContent    = hub.note;
    overlay.classList.remove('hidden');
  }

  function hide() {
    overlay.classList.add('hidden');
  }

  closeBtn.addEventListener('click', hide);
  overlay.addEventListener('click', e => { if (e.target === overlay) hide(); });

  return { show, hide };
})();
