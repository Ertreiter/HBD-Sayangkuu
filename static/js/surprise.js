/**
 * surprise.js — Big Surprise screen with confetti particle system
 */

'use strict';

const Surprise = (() => {
  const overlay    = document.getElementById('surprise-overlay');
  const title      = document.getElementById('surprise-title');
  const message    = document.getElementById('surprise-message');
  const replayBtn  = document.getElementById('surprise-replay-btn');
  const confCanvas = document.getElementById('confetti-canvas');
  let ctx, animId, particles = [];

  const COLORS = [
    '#f43f5e','#fb7185','#fda4af','#fbbf24',
    '#34d399','#60a5fa','#a78bfa','#f472b6',
    '#fff','#fcd34d',
  ];

  function initCanvas() {
    confCanvas.width  = window.innerWidth;
    confCanvas.height = window.innerHeight;
    ctx = confCanvas.getContext('2d');
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * confCanvas.width,
        y: Math.random() * confCanvas.height * -1,  // start above screen
        r: Math.random() * 6 + 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed: Math.random() * 3 + 1.5,
        angle: Math.random() * Math.PI * 2,
        spin:  (Math.random() - 0.5) * 0.15,
        swing: Math.random() * 3,
        swingSpeed: Math.random() * 0.04 + 0.02,
        isHeart: Math.random() > 0.65,
        t: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawHeart(cx, cy, size) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * 0.25);
    ctx.bezierCurveTo(cx, cy, cx - size, cy, cx - size, cy - size * 0.4);
    ctx.bezierCurveTo(cx - size, cy - size, cx, cy - size * 0.8, cx, cy - size * 0.4);
    ctx.bezierCurveTo(cx, cy - size * 0.8, cx + size, cy - size, cx + size, cy - size * 0.4);
    ctx.bezierCurveTo(cx + size, cy, cx, cy, cx, cy + size * 0.25);
    ctx.closePath();
    ctx.fill();
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, confCanvas.width, confCanvas.height);

    particles.forEach(p => {
      p.t += p.swingSpeed;
      p.x += Math.sin(p.t) * p.swing;
      p.y += p.speed;
      p.angle += p.spin;

      if (p.y > confCanvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * confCanvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;

      if (p.isHeart) {
        drawHeart(0, 0, p.r);
      } else {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.4);
      }

      ctx.restore();
    });

    animId = requestAnimationFrame(animateConfetti);
  }

  function show() {
    title.textContent   = `Happy Birthday, ${CONFIG.herName}! 🎂`;
    message.textContent = CONFIG.surpriseMessage;
    overlay.classList.remove('hidden');
    initCanvas();
    createParticles();
    animateConfetti();
  }

  function hide() {
    overlay.classList.add('hidden');
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    if (ctx) ctx.clearRect(0, 0, confCanvas.width, confCanvas.height);
  }

  replayBtn.addEventListener('click', () => {
    hide();
    // reset game for a replay
    if (window.Game) Game.reset();
  });

  window.addEventListener('resize', () => {
    if (!overlay.classList.contains('hidden')) {
      initCanvas();
    }
  });

  return { show, hide };
})();
