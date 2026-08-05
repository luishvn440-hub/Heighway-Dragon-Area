/* ═══════════════════════════════════════════════════════════
   Heighway Dragon — Area via Rectangles
   heighway-area-script.js

   Key idea (from Riddle):
   Walk the dragon tail→head. Each consecutive PAIR of segments
   (sharing a vertex) turns ±90°, so together they form two
   adjacent sides of a square. Draw that square. At even
   iterations squares are axis-aligned; at odd they are 45°.
   Count: 2^(k-1) squares × 1/2^k area each = 1/2 total.
   ═══════════════════════════════════════════════════════════ */

const PAL = {
  violet: { sq1:'#a78bfa', sq2:'#7c3aed', curve:'#c4b5fd' },
  teal:   { sq1:'#2dd4bf', sq2:'#0d9488', curve:'#99f6e4' },
  coral:  { sq1:'#fb7185', sq2:'#e11d48', curve:'#fda4af' },
  blue:   { sq1:'#60a5fa', sq2:'#2563eb', curve:'#bfdbfe' },
  amber:  { sq1:'#fbbf24', sq2:'#d97706', curve:'#fde68a' },
};
const TILE_COLORS = ['#a78bfa','#2dd4bf','#fb7185','#fbbf24'];
const VW = 700, VH = 520, PAD = 36;
let currentMode = 'squares';
let currentSVG  = '';

/* ── Build dragon on exact integer grid ─────────────────── */
function paperFoldTurns(n) {
  let t = [1];
  for (let i = 1; i < n; i++) {
    const c = [...t]; t.push(1);
    for (let j = c.length - 1; j >= 0; j--) t.push(c[j] === 1 ? 0 : 1);
  }
  return t;
}

function buildDragon(turns) {
  /* Use doubled integer coords so all vertices stay integer.
     dx/dy pairs for the 4 axis directions (y-down). */
  const DX = [1, 0, -1, 0], DY = [0, -1, 0, 1];
  let dir = 0, x = 0, y = 0;
  const pts = [{ x, y }];
  for (const t of turns) {
    dir = (dir + (t === 1 ? 3 : 1) + 4) % 4;
    x += DX[dir]; y += DY[dir];
    pts.push({ x, y });
  }
  return pts;
}

function rotate90(pts, k) {
  const r = ((k % 4) + 4) % 4;
  return pts.map(p => {
    let x = p.x, y = p.y;
    for (let i = 0; i < r; i++) { const t = x; x = -y; y = t; }
    return { x, y };
  });
}

/* ── Fit ────────────────────────────────────────────────── */
function makeFit(allPts) {
  const flat = allPts.flat();
  const xs = flat.map(p => p.x), ys = flat.map(p => p.y);
  const mnX = Math.min(...xs), mxX = Math.max(...xs);
  const mnY = Math.min(...ys), mxY = Math.max(...ys);
  const sc  = Math.min((VW - PAD*2) / (mxX - mnX || 1), (VH - PAD*2) / (mxY - mnY || 1));
  const ox  = (VW - (mxX - mnX) * sc) / 2 - mnX * sc;
  const oy  = (VH - (mxY - mnY) * sc) / 2 - mnY * sc;
  return {
    map: p => ({ x: +(p.x * sc + ox).toFixed(2), y: +(p.y * sc + oy).toFixed(2) }),
    sc, ox, oy
  };
}

/* ── Boundary edge detection (integer grid) ─────────────── */
function segKey(p1, p2) {
  const a = `${p1.x},${p1.y}`, b = `${p2.x},${p2.y}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function findBoundaryEdges(pts) {
  const count = {}, edgeMap = {};
  for (let i = 0; i < pts.length - 1; i++) {
    const key = segKey(pts[i], pts[i + 1]);
    count[key]   = (count[key]   || 0) + 1;
    edgeMap[key] = { p1: pts[i], p2: pts[i + 1] };
  }
  return Object.keys(count).filter(k => count[k] === 1).map(k => edgeMap[k]);
}

function chainEdges(edges) {
  if (!edges.length) return [];
  const pk = p => `${p.x},${p.y}`, adj = {};
  for (const e of edges) {
    const ka = pk(e.p1), kb = pk(e.p2);
    if (!adj[ka]) adj[ka] = [];
    if (!adj[kb]) adj[kb] = [];
    adj[ka].push({ key: kb, pt: e.p2 });
    adj[kb].push({ key: ka, pt: e.p1 });
  }
  const visited = new Set(), chains = [];
  for (const startKey of Object.keys(adj)) {
    if (visited.has(startKey)) continue;
    const ring = []; let cur = startKey, prev = null;
    while (true) {
      visited.add(cur);
      const nbs = adj[cur] || []; let next = null;
      for (const nb of nbs) {
        if (nb.key !== prev && !visited.has(nb.key)) { next = nb; break; }
      }
      if (!next) break;
      ring.push(next.pt); prev = cur; cur = next.key;
    }
    if (ring.length > 2) chains.push(ring);
  }
  chains.sort((a, b) => b.length - a.length);
  return chains;
}

function closedPath(pts) {
  if (!pts || pts.length < 2) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
}

function hslC(i, t) { return `hsl(${Math.round(i / t * 360)},72%,58%)`; }

/* ════════════════════════════════════════════════════════
   CORE: Build squares from consecutive segment pairs
   ════════════════════════════════════════════════════════
   Walk dragon pts[i], pts[i+1], pts[i+2].
   The two segments share vertex pts[i+1].
   They are perpendicular (dragon always turns ±90°).
   The square has corners:
     A = pts[i]
     B = pts[i+1]
     C = pts[i+2]
     D = A + C - B   (the 4th corner, completing the square)
*/
function buildSquares(pts) {
  const squares = [];
  for (let i = 0; i + 2 < pts.length; i += 2) {
    const A = pts[i], B = pts[i + 1], C = pts[i + 2];
    const D = { x: A.x + C.x - B.x, y: A.y + C.y - B.y };
    squares.push([A, B, C, D]);
  }
  return squares;
}

/* ── Lattice grid SVG ───────────────────────────────────── */
function latticeGridSVG(fit) {
  let svg = '<g opacity="0.12">';
  for (let v = -30; v <= 30; v++) {
    const a = fit.map({ x: v, y: -30 }), b = fit.map({ x: v, y: 30 });
    const c = fit.map({ x: -30, y: v }), d = fit.map({ x: 30, y: v });
    svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#fff" stroke-width="0.5"/>`;
    svg += `<line x1="${c.x}" y1="${c.y}" x2="${d.x}" y2="${d.y}" stroke="#fff" stroke-width="0.5"/>`;
  }
  svg += '</g>';
  return svg;
}

/* ════════════════════════════════════════════════════════
   DRAW
   ════════════════════════════════════════════════════════ */
function draw() {
  const depth       = +document.getElementById('depth').value;
  const colormode   = document.getElementById('colormode').value;
  const scheme      = document.getElementById('scheme').value;
  const showcurve   = document.getElementById('showcurve').value === 'on';
  const showbound   = document.getElementById('showboundary').value === 'on';
  const showgrid    = document.getElementById('showgrid').value === 'on';

  document.getElementById('dv').textContent = depth;

  const pal    = PAL[scheme];
  const clamp  = Math.min(depth, 12);
  const turns  = paperFoldTurns(clamp);
  const dragon = buildDragon(turns);

  let inner = '';

  /* ── SQUARES mode ───────────────────────────────────── */
  if (currentMode === 'squares') {
    const squares = buildSquares(dragon);
    const numSq   = squares.length;

    /* Fit to all square corners + dragon points */
    const allCorners = squares.flat().concat(dragon);
    const fit = makeFit([allCorners]);

    /* Grid */
    if (showgrid) inner += latticeGridSVG(fit);

    /* Squares */
    const sqSVG_list = [];
    squares.forEach((sq, idx) => {
      const [A, B, C, D] = sq.map(fit.map.bind(fit));
      const d = `M${A.x},${A.y} L${B.x},${B.y} L${C.x},${C.y} L${D.x},${D.y} Z`;
      let fill, stroke;
      if (colormode === 'alternating') {
        fill   = idx % 2 === 0 ? '#ef4444' : '#3b82f6';
        stroke = idx % 2 === 0 ? '#dc2626' : '#2563eb';
      } else if (colormode === 'rainbow') {
        fill   = hslC(idx, numSq);
        stroke = fill;
      } else {
        fill   = idx % 2 === 0 ? pal.sq1 : pal.sq2;
        stroke = fill;
      }
      sqSVG_list.push(`<path d="${d}" fill="${fill}" fill-opacity="0.35" stroke="${stroke}" stroke-width="0.6" stroke-linejoin="round"/>`);
    });
    inner += sqSVG_list.join('');

    /* Curve overlay */
    if (showcurve) {
      const mapped = dragon.map(fit.map.bind(fit));
      let cd = `M${mapped[0].x},${mapped[0].y}`;
      for (let i = 1; i < mapped.length; i++) cd += ` L${mapped[i].x},${mapped[i].y}`;
      inner += `<path d="${cd}" fill="none" stroke="${pal.curve}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>`;
      /* Mark tail and head */
      inner += `<circle cx="${mapped[0].x}" cy="${mapped[0].y}" r="3.5" fill="#22c55e" opacity="0.9"/>`;
      inner += `<circle cx="${mapped[mapped.length-1].x}" cy="${mapped[mapped.length-1].y}" r="3.5" fill="#f97316" opacity="0.9"/>`;
    }

    /* Boundary — closed perimeter traced from actual boundary edges */
    if (showbound) {
      const bEdges = findBoundaryEdges(dragon);
      const rings  = chainEdges(bEdges);
      for (const ring of rings) {
        const d = closedPath(ring.map(fit.map.bind(fit)));
        if (d) inner += `<path d="${d}" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="8 5" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
    }

    /* Update readout */
    const segCount = clamp >= 1 ? Math.pow(2, clamp) : 1;
    const side     = Math.pow(1 / Math.sqrt(2), clamp);
    const sqArea   = side * side;
    const totalArea = numSq * sqArea;
    document.getElementById('out-iter').textContent   = clamp;
    document.getElementById('out-segs').textContent   = segCount.toLocaleString();
    document.getElementById('out-sq').textContent     = numSq.toLocaleString();
    document.getElementById('out-side').textContent   = `(1/√2)^${clamp} ≈ ${side.toFixed(4)}`;
    document.getElementById('out-sqarea').textContent = `1/2^${clamp} = ${sqArea.toFixed(6)}`;
    document.getElementById('out-total').textContent  = `${totalArea.toFixed(6)} ≈ ½`;
  }

  /* ── TILING mode ────────────────────────────────────── */
  else if (currentMode === 'tiling') {
    const squares  = buildSquares(dragon);
    const allSets  = [0, 1, 2, 3].map(k => rotate90(dragon, k));
    const allSqs   = [0, 1, 2, 3].map(k =>
      buildSquares(rotate90(dragon, k))
    );
    const allCorners = allSqs.flat(2);
    const fit = makeFit([allCorners]);

    if (showgrid) inner += latticeGridSVG(fit);

    /* Draw squares for each rotated copy */
    allSqs.forEach((sqs, k) => {
      const fillCol   = TILE_COLORS[k];
      sqs.forEach((sq, idx) => {
        const [A, B, C, D] = sq.map(fit.map.bind(fit));
        const d = `M${A.x},${A.y} L${B.x},${B.y} L${C.x},${C.y} L${D.x},${D.y} Z`;
        inner += `<path d="${d}" fill="${fillCol}" fill-opacity="0.25" stroke="${fillCol}" stroke-width="0.5" stroke-linejoin="round"/>`;
      });
    });

    /* Curve overlays */
    if (showcurve) {
      allSets.forEach((pts, k) => {
        const mapped = pts.map(fit.map.bind(fit));
        let cd = `M${mapped[0].x},${mapped[0].y}`;
        for (let i = 1; i < mapped.length; i++) cd += ` L${mapped[i].x},${mapped[i].y}`;
        inner += `<path d="${cd}" fill="none" stroke="${TILE_COLORS[k]}" stroke-width="0.8" opacity="0.7" stroke-linecap="round" stroke-linejoin="round"/>`;
      });
    }

    /* Boundary of combined 4-copy shape */
    if (showbound) {
      const allPts = allSets.flat();
      const bEdges = findBoundaryEdges(allPts);
      const rings  = chainEdges(bEdges);
      for (const ring of rings) {
        const d = closedPath(ring.map(fit.map.bind(fit)));
        if (d) inner += `<path d="${d}" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="8 5" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
    }

    const numSq = squares.length;
    document.getElementById('out-iter').textContent   = clamp;
    document.getElementById('out-segs').textContent   = Math.pow(2, clamp).toLocaleString() + ' × 4';
    document.getElementById('out-sq').textContent     = (numSq * 4).toLocaleString() + ' total';
    document.getElementById('out-side').textContent   = `(1/√2)^${clamp}`;
    document.getElementById('out-sqarea').textContent = `1/2^${clamp}`;
    document.getElementById('out-total').textContent  = `4 × ½ = 2`;
  }

  /* ── CURVE only mode ────────────────────────────────── */
  else if (currentMode === 'curve') {
    const fit    = makeFit([dragon]);
    const mapped = dragon.map(fit.map.bind(fit));

    if (showgrid) inner += latticeGridSVG(fit);

    let cd = `M${mapped[0].x},${mapped[0].y}`;
    for (let i = 1; i < mapped.length; i++) cd += ` L${mapped[i].x},${mapped[i].y}`;
    inner += `<path d="${cd}" fill="none" stroke="${pal.curve}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;

    /* Mark tail/head */
    inner += `<circle cx="${mapped[0].x}" cy="${mapped[0].y}" r="4" fill="#22c55e" opacity="0.9"/>`;
    inner += `<circle cx="${mapped[mapped.length-1].x}" cy="${mapped[mapped.length-1].y}" r="4" fill="#f97316" opacity="0.9"/>`;

    if (showbound) {
      const bEdges = findBoundaryEdges(dragon);
      const rings  = chainEdges(bEdges);
      for (const ring of rings) {
        const d = closedPath(ring.map(fit.map.bind(fit)));
        if (d) inner += `<path d="${d}" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="8 5" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
    }

    const seg = dragon.length - 1;
    document.getElementById('out-iter').textContent   = clamp;
    document.getElementById('out-segs').textContent   = seg.toLocaleString();
    document.getElementById('out-sq').textContent     = '—';
    document.getElementById('out-side').textContent   = '—';
    document.getElementById('out-sqarea').textContent = '—';
    document.getElementById('out-total').textContent  = '½ (always)';
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}">` +
    `<rect width="${VW}" height="${VH}" fill="#0d0f14"/>` +
    inner + `</svg>`;
  currentSVG = svg;
  document.getElementById('wrap').innerHTML = svg;
}

/* ── Tabs ────────────────────────────────────────────────── */
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    /* Adjust max depth by mode */
    const maxD = currentMode === 'tiling' ? 10 : 12;
    document.getElementById('depth').max = maxD;
    if (+document.getElementById('depth').value > maxD)
      document.getElementById('depth').value = maxD;
    draw();
  });
});

['depth','colormode','scheme','showcurve','showboundary','showgrid'].forEach(id => {
  document.getElementById(id).addEventListener('input',  draw);
  document.getElementById(id).addEventListener('change', draw);
});

function downloadSVG() {
  const blob = new Blob([currentSVG], { type: 'image/svg+xml' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `heighway-area-${currentMode}.svg`;
  a.click();
}

draw();
