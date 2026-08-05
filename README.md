<div align="center">

# 🐉 Fractal Curve Explorer

**An interactive collection of classic fractal curves rendered entirely in SVG — no libraries, no build tools, no internet required.**

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-7F77DD?style=for-the-badge&logo=github)](https://your-username.github.io/fractal-curves/)
[![SVG](https://img.shields.io/badge/Rendered%20in-SVG-ff6b35?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/SVG)
[![Vanilla JS](https://img.shields.io/badge/Built%20with-Vanilla%20JS-f7df1e?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

</div>

---

## 📐 What is this?

A suite of **6 standalone web pages** that generate, animate, and export fractal curves using pure JavaScript and inline SVG. Every page is self-contained — open the HTML file locally or deploy to GitHub Pages and it just works.

Each page includes:
- **Interactive controls** — iteration depth, color palettes, stroke width, rainbow mode
- **SVG export** — download exactly what is rendered, vector-quality at any scale
- **Mathematical info cards** — explaining the construction, properties, and history of each curve
- **Perimeter detection** — true closed boundary polygon traced from actual fractal edge segments

---

## 🗂️ Pages included

| File | Fractal | Highlights |
|------|---------|-----------|
| `index.html` | **10-fractal Explorer** | Dropdown selector for all curves below |
| `dragon-index.html` | **Heighway Dragon** | Paper fold, L-system, perimeter |
| `gosper-index.html` | **Gosper / Flowsnake** | Hexagonal L-system, true boundary polygon |
| `heighway-index.html` | **Heighway — Tiling & Boundary** | 4-copy tiling, IFS boundary components, lattice grid |
| `heighway-area.html` | **Heighway — Area via Squares** | Rectangle pairs, area = ½ proof, 4-copy tiling |
| *(Koch pages)* | **Koch Snowflake · Anti-Snowflake · Koch Curve** | Included in the multi-fractal explorer |

---

## 🌀 Fractal curves

### Multi-fractal Explorer
Select from **10 classic curves** in a single interface:

| Group | Curves |
|-------|--------|
| Koch family | Snowflake · Anti-Snowflake · Single curve |
| Space-fillers | Dragon · Gosper/Flowsnake · Hilbert · Peano |
| Sierpiński | Triangle · Arrowhead |
| Other | Lévy C curve |

---

### 🐉 Heighway Dragon

> *"Fold a strip of paper in half repeatedly in the same direction. Open flat so every crease is a right angle — this is the dragon."*

Three construction methods, all producing the same curve:

```
Paper fold:  RRLRRLLRRRLLRLL...   (turn sequence)
L-system:    Axiom FX
             F → Z
             X → +FX−−FY+
             Y → −FX++FY−
IFS:         f₁: scale 1/√2, rotate 45°
             f₂: scale 1/√2, rotate 135°, translate (1,0)
```

**Properties:** area = ½ · boundary dimension ≈ 1.5236 · tiles the plane · featured in every chapter of *Jurassic Park* (Crichton, 1990)

---

### 🌊 Gosper Curve (Flowsnake)

Hexagonal L-system with 60° turns. Each iteration wraps **7 copies** of the previous shape into one larger hexagonal region.

```
Axiom:  A
Rules:  A → A-B--B+A++AA+B-
        B → +A-BB--B-A++A+B
Angle:  60°
```

The **true perimeter** is detected by finding boundary edges (segments traversed exactly once on the integer triangular grid) and chaining them into a closed polygon.

---

### 🧩 Heighway Dragon — Tiling

Four 90°-rotated copies of the dragon nestle **tail-to-tail** to tile the entire plane. The combined shape has 4-fold rotational symmetry. Toggle the square lattice to see how vertices align at grid points spaced (1/√2)ⁿ apart.

| Copies | Symmetry | Total area |
|--------|----------|-----------|
| 1 | — | ½ |
| 2 | 180° | 1 |
| 4 | 90° | 2 |

---

### 📐 Heighway Dragon — Area via Squares

A visual proof that the dragon's area is always exactly **½**:

Walk tail→head along the dragon. Each consecutive **pair of segments** (which always meet at ±90°) forms two sides of a square. Draw and count those squares.

```
At iteration k:
  Segments  = 2^k
  Squares   = 2^(k-1)
  Side      = (1/√2)^k
  Square area = 1/2^k
  ─────────────────────
  Total area  = 2^(k-1) × 1/2^k = 1/2   ✓ (always)
```

The squares tile the plane with 4 rotated copies, just as the dragon curve itself does.

---

### 🔴 Heighway Dragon — Boundary

The boundary of the Heighway dragon is itself a fractal with **Hausdorff dimension ≈ 1.523627** (between a smooth curve and a filled region).

It decomposes into **4 self-similar components**, each the attractor of a 3-function IFS:

| Component | Color | Maps |
|-----------|-------|------|
| R | 🔴 Red | f₁, f₂, f₃ |
| B | 🔵 Blue | g₁, g₂, g₃ |
| O | 🟠 Orange | h₁, h₂, h₃ |
| G | 🟢 Green | k₁, k₂, k₃ |

The dimension d satisfies **x³ − x − 1 = 0**, giving d = −ln(x)/ln(√2) ≈ 1.523627.

---

## 🔧 How it works

### Integer grid
The dragon and Gosper curves are built on **exact integer grids** — no floating-point rounding. This makes boundary detection reliable: a segment traversed exactly once is a boundary edge; traversed twice means it is shared by two adjacent cells and is interior.

### Boundary polygon algorithm
```
1. Build all segments on the integer grid
2. Count occurrences of each canonical edge key
3. Keep edges with count = 1  →  boundary edges
4. Build adjacency list from boundary edge endpoints
5. Walk the adjacency list (each vertex has exactly 2 neighbours)
6. Close the ring with Z  →  true closed perimeter
```

### L-systems
Each symbol string is expanded by rewriting rules for n iterations, then a virtual turtle reads it:
- `F` / `A` / `B` → move forward and draw
- `+` → turn left by the curve's angle
- `−` → turn right by the curve's angle

### SVG rendering
All output is inline SVG injected directly into the DOM — no `<canvas>`, no WebGL. The download button serializes the current SVG string to a Blob, so the exported file is a lossless vector graphic at any scale.

---

## 🚀 Getting started

### Option 1 — Open locally
```bash
git clone https://github.com/your-username/fractal-curves.git
cd fractal-curves
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

No installation, no `npm install`, no build step.

### Option 2 — GitHub Pages
1. Push the repository to GitHub
2. Go to **Settings → Pages → Branch: main → Save**
3. Your site is live at `https://your-username.github.io/fractal-curves/`

---

## 📁 Repository structure

```
fractal-curves/
│
├── index.html                  ← Multi-fractal explorer (10 curves)
├── style.css
├── script.js
│
├── dragon-index.html           ← Heighway Dragon (paper fold + L-system)
├── dragon-style.css
├── dragon-script.js
│
├── gosper-index.html           ← Gosper Curve / Flowsnake
├── gosper-style.css
├── gosper-script.js
│
├── heighway-index.html         ← Tiling + Boundary (4 IFS components)
├── heighway-style.css
├── heighway-script.js
│
├── heighway-area.html          ← Area via square pairs
├── heighway-area-style.css
├── heighway-area-script.js
│
└── README.md
```

---

## 🎛️ Common controls

| Control | Description |
|---------|-------------|
| **Iterations** | Recursion depth — each step multiplies segments |
| **Color palette** | Violet · Teal · Coral · Blue · Amber |
| **Stroke width** | Line thickness 1–6 px |
| **Rainbow mode** | Colors each segment by its index along the curve |
| **Perimeter** | Toggles the red dashed closed boundary polygon |
| **Lattice grid** | Shows the underlying square grid (tiling pages) |
| **↓ Download SVG** | Exports the exact current rendering as an SVG file |

---

## 📚 References

- Larry Riddle, Agnes Scott College — [Heighway Dragon](https://larryriddle.agnesscott.org/ifs/heighway/heighway.htm)
- Davis, C. & Knuth, D.E. (1970). *Number representations and dragon curves*
- Chang, A. & Zhang, T. (1999). *The Fractal Geometry of the Boundary of Dragon Curves*
- Gardner, M. (1967). *Mathematical Games*. Scientific American
- Crichton, M. (1990). *Jurassic Park* — dragon curve iterations as chapter headers

---

## 📄 License

MIT — free to use, modify, and share.

---

<div align="center">

*Built with vanilla JavaScript and SVG · Zero dependencies · Works offline*

**[⭐ Star this repo](https://github.com/your-username/fractal-curves) if you find it useful!**

</div>
