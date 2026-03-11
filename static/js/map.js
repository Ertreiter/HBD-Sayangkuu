/**
 * map.js — Pixel-art style 2D top-down map renderer
 * Draws a tiled background, decorative elements, and hub markers on canvas.
 */

'use strict';

const MapRenderer = (() => {
  let canvas, ctx, W, H;
  let onHubClicked = () => {};
  let hoveredHub = null;
  const TILE = 28;  // tile size in px (internal resolution)

  // ── Colour palettes ──────────────────────────────────────────────
  const PALETTE = {
    grass1: '#2d4a1e',
    grass2: '#3a5e28',
    grass3: '#4a7a32',
    path:   '#6b4c30',
    path2:  '#7a5a3c',
    water:  '#1a3a5c',
    water2: '#1f4a73',
    flower: '#e879a0',
    flowerYellow: '#f5c842',
    tree:   '#1e3d14',
    treeTrunk: '#6b4422',
  };

  // ── Deterministic pseudo-random based on position ────────────────
  function prand(x, y, seed=1) {
    let n = Math.sin(x * 127.1 + y * 311.7 + seed * 43.0) * 43758.5453;
    return n - Math.floor(n);
  }

  // ── Draw a single tile ───────────────────────────────────────────
  function drawTile(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
  }

  // ── Build tile map ───────────────────────────────────────────────
  function buildMap(cols, rows) {
    // path positions (snaking across map)
    const pathCells = new Set();
    const pathRow1 = Math.floor(rows * 0.42);
    const pathRow2 = Math.floor(rows * 0.72);
    for (let c=0; c<cols; c++) {
      pathCells.add(`${c},${pathRow1}`);
      pathCells.add(`${c},${pathRow1+1}`);
      if (c > cols*0.35 && c < cols*0.65) {
        pathCells.add(`${c},${pathRow1+2}`);
        pathCells.add(`${c},${pathRow2}`);
      }
      if (c >= cols*0.5 && c < cols*0.52) {
        for(let r=pathRow1; r<=pathRow2; r++) pathCells.add(`${c},${r}`);
      }
    }

    // water lake (top-right area)
    const waterCells = new Set();
    for (let c=Math.floor(cols*0.62); c<Math.floor(cols*0.85); c++) {
      for (let r=2; r<Math.floor(rows*0.32); r++) {
        if (prand(c,r,7) > 0.15) waterCells.add(`${c},${r}`);
      }
    }

    return { pathCells, waterCells };
  }

  // ── Render terrain ───────────────────────────────────────────────
  function renderTerrain(cols, rows, pathCells, waterCells) {
    for (let r=0; r<rows; r++) {
      for (let c=0; c<cols; c++) {
        const key = `${c},${r}`;
        if (waterCells.has(key)) {
          ctx.fillStyle = (prand(c,r,3)>0.5) ? PALETTE.water : PALETTE.water2;
        } else if (pathCells.has(key)) {
          ctx.fillStyle = (prand(c,r,2)>0.5) ? PALETTE.path : PALETTE.path2;
        } else {
          const g = prand(c,r,1);
          ctx.fillStyle = g>0.6 ? PALETTE.grass1 : g>0.3 ? PALETTE.grass2 : PALETTE.grass3;
        }
        ctx.fillRect(c*TILE, r*TILE, TILE, TILE);

        // pixel noise
        if (!pathCells.has(key) && !waterCells.has(key) && prand(c,r,9)>0.87) {
          ctx.fillStyle = 'rgba(255,255,255,0.04)';
          ctx.fillRect(c*TILE + (prand(c,r,5)*TILE|0), r*TILE + (prand(c,r,6)*TILE|0), 3, 3);
        }
      }
    }
  }

  // ── Render decorations (flowers, trees) ──────────────────────────
  function renderDecorations(cols, rows, pathCells, waterCells, hubs) {
    const hubPositions = hubs.map(h => ({ cx: h.x * W, cy: h.y * H }));

    for (let r=0; r<rows; r++) {
      for (let c=0; c<cols; c++) {
        const key = `${c},${r}`;
        if (pathCells.has(key) || waterCells.has(key)) continue;
        const px = c*TILE + TILE/2, py = r*TILE + TILE/2;
        // don't draw near hub centres
        if (hubPositions.some(h => Math.hypot(h.cx-px, h.cy-py) < 48)) continue;

        const v = prand(c,r,4);
        if (v > 0.92) {
          // Tree
          ctx.fillStyle = PALETTE.treeTrunk;
          ctx.fillRect(c*TILE+TILE/2-3, r*TILE+TILE-7, 6, 7);
          ctx.fillStyle = PALETTE.tree;
          ctx.beginPath();
          ctx.arc(c*TILE+TILE/2, r*TILE+TILE/2-2, 9, 0, Math.PI*2);
          ctx.fill();
        } else if (v > 0.85) {
          // Flower
          const fc = prand(c,r,8)>0.5 ? PALETTE.flower : PALETTE.flowerYellow;
          ctx.fillStyle = fc;
          ctx.beginPath();
          ctx.arc(c*TILE+TILE/2, r*TILE+TILE/2, 3, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }

    // water shimmer
    waterCells.forEach(key => {
      const [c,r] = key.split(',').map(Number);
      if (prand(c,r,11)>0.75) {
        ctx.fillStyle = 'rgba(150,210,255,0.12)';
        ctx.fillRect(c*TILE+3, r*TILE+TILE/2, TILE-6, 2);
      }
    });
  }

  // ── Draw hub marker ──────────────────────────────────────────────
  function drawHub(hub, unlocked, hovered, t) {
    const cx = hub.x * W;
    const cy = hub.y * H;
    const R = 22;

    // pulse ring (for locked hubs)
    if (!unlocked) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.003 + hub.id);
      ctx.beginPath();
      ctx.arc(cx, cy, R + 10 + pulse * 8, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(244,63,94,${0.15 + pulse * 0.2})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // outer glow
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R+10);
    if (unlocked) {
      grd.addColorStop(0, 'rgba(244,63,94,0.4)');
      grd.addColorStop(1, 'rgba(244,63,94,0)');
    } else {
      grd.addColorStop(0, 'rgba(100,100,120,0.3)');
      grd.addColorStop(1, 'rgba(100,100,120,0)');
    }
    ctx.beginPath();
    ctx.arc(cx, cy, R+10, 0, Math.PI*2);
    ctx.fillStyle = grd;
    ctx.fill();

    // circle body
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fillStyle = unlocked
      ? (hovered ? '#f43f5e' : '#be185d')
      : (hovered ? '#5a5a70' : '#3a3a50');
    ctx.fill();
    ctx.strokeStyle = unlocked ? '#fda4af' : '#6a6a80';
    ctx.lineWidth = 2;
    ctx.stroke();

    // icon
    ctx.font = `${R - 4}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(unlocked ? hub.emoji : '🔒', cx, cy + 1);

    // name label
    ctx.font = `bold 11px Quicksand, sans-serif`;
    ctx.fillStyle = unlocked ? '#fecdd3' : '#9ca3af';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    // background pill
    const label = hub.name;
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    const lx = cx - tw/2 - 6, ly = cy + R + 4;
    ctx.roundRect(lx, ly, tw+12, 18, 6);
    ctx.fill();
    ctx.fillStyle = unlocked ? '#fecdd3' : '#9ca3af';
    ctx.fillText(label, cx, cy + R + 6);
  }

  // ── Main render loop ─────────────────────────────────────────────
  let animFrame = null;
  let getUnlocked = () => [];

  function render(t) {
    ctx.clearRect(0, 0, W, H);
    const cols = Math.ceil(W/TILE)+1;
    const rows = Math.ceil(H/TILE)+1;
    const { pathCells, waterCells } = buildMap(cols, rows);
    renderTerrain(cols, rows, pathCells, waterCells);
    renderDecorations(cols, rows, pathCells, waterCells, HUBS);

    const unlocked = getUnlocked();
    HUBS.forEach(hub => {
      drawHub(hub, unlocked.includes(hub.id), hoveredHub === hub.id, t);
    });

    animFrame = requestAnimationFrame(render);
  }

  // ── Resize canvas ────────────────────────────────────────────────
  function resize() {
    const wrapper = canvas.parentElement;
    const cw = wrapper.clientWidth;
    const ch = Math.round(cw * 0.6);   // ~5:3 ratio
    canvas.width  = cw;
    canvas.height = ch;
    W = cw;
    H = ch;
  }

  // ── Hit testing ──────────────────────────────────────────────────
  function hubAtPoint(px, py) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (px - rect.left) * scaleX;
    const my = (py - rect.top)  * scaleY;
    return HUBS.find(h => Math.hypot(h.x * W - mx, h.y * H - my) < 28) || null;
  }

  // ── Tooltip update ───────────────────────────────────────────────
  function updateTooltip(hub, evt) {
    const tooltip = document.getElementById('hub-tooltip');
    if (!hub) { tooltip.classList.add('hidden'); return; }
    const rect = canvas.getBoundingClientRect();
    const parentRect = canvas.parentElement.getBoundingClientRect();
    const scaleX = rect.width / W;
    const scaleY = rect.height / H;
    tooltip.textContent = hub.name;
    tooltip.style.left = (rect.left - parentRect.left + hub.x * W * scaleX) + 'px';
    tooltip.style.top  = (rect.top  - parentRect.top  + hub.y * H * scaleY - 10) + 'px';
    tooltip.classList.remove('hidden');
  }

  // ── Init ─────────────────────────────────────────────────────────
  function init(onHubClickedCb, getUnlockedCb) {
    canvas = document.getElementById('map');
    ctx = canvas.getContext('2d');
    onHubClicked = onHubClickedCb;
    getUnlocked  = getUnlockedCb;

    resize();
    window.addEventListener('resize', () => { resize(); });

    // click
    canvas.addEventListener('click', evt => {
      const hub = hubAtPoint(evt.clientX, evt.clientY);
      if (hub) onHubClicked(hub.id);
    });

    // hover
    canvas.addEventListener('mousemove', evt => {
      const hub = hubAtPoint(evt.clientX, evt.clientY);
      const newId = hub ? hub.id : null;
      if (newId !== hoveredHub) {
        hoveredHub = newId;
        canvas.style.cursor = newId ? 'pointer' : 'default';
        updateTooltip(hub, evt);
      }
    });

    canvas.addEventListener('mouseleave', () => {
      hoveredHub = null;
      canvas.style.cursor = 'default';
      document.getElementById('hub-tooltip').classList.add('hidden');
    });

    // touch support
    canvas.addEventListener('touchend', evt => {
      evt.preventDefault();
      const t = evt.changedTouches[0];
      const hub = hubAtPoint(t.clientX, t.clientY);
      if (hub) onHubClicked(hub.id);
    }, { passive: false });

    animFrame = requestAnimationFrame(render);
  }

  return { init };
})();
