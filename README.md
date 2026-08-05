# Heighway Dragon — Area via Rectangles

An interactive web visualization that demonstrates why the [Heighway Dragon curve](https://en.wikipedia.org/wiki/Dragon_curve) has an area of exactly **½**, using a square-construction method inspired by the classic paper-folding sequence.

🔗 **Live Demo:** Open [`heighway-area.html`](https://luishvn440-hub.github.io/Heighway-Dragon-Area/heighway-area.html) in any modern browser.

---

## Overview

The Heighway Dragon is a famous self-similar fractal curve that fills space as its iteration depth increases. This project provides an interactive SVG-based explorer with three viewing modes, real-time area calculations, and exportable graphics.

### The Core Idea

Walk the dragon from tail to head. Every consecutive **pair** of segments forms two adjacent sides of a square (since every turn is ±90°). Draw that square. At even iterations the squares align with the axis grid; at odd iterations they are rotated 45°.

- At iteration **k**: there are **2ᵏ** segments → **2ᵏ⁻¹** squares
- Each segment has length **(1/√2)ᵏ**
- Each square has area **(1/√2)²ᵏ = 1/2ᵏ**
- **Total area = 2ᵏ⁻¹ × 1/2ᵏ = ½**

This holds for **every** iteration — the area is always exactly ½.

---

## Features

| Feature | Description |
|---------|-------------|
| **3 Viewing Modes** | Squares, Tiling (4 rotated copies), and Curve-only |
| **Adjustable Depth** | Iterations 1–12 (Squares/Curve), 1–10 (Tiling) |
| **Color Schemes** | Violet, Teal, Coral, Blue, Amber |
| **Color Modes** | Alternating, Rainbow, or Palette-based |
| **Toggle Overlays** | Show/hide the dragon curve, boundary outline, and lattice grid |
| **Live Readout** | Real-time display of iteration count, segments, squares, side length, square area, and total area |
| **SVG Export** | Download the current view as a scalable SVG file |
| **Responsive Layout** | Clean, mobile-friendly interface |

---

## File Structure

```
Heighway-Dragon-Area/
├── heighway-area.html        # Main page with UI controls and info panels
├── heighway-area-script.js   # Dragon generation, square construction, SVG rendering
├── heighway-area-style.css   # Responsive styling and theme
└── README.md                 # This file
```

---

## How to Use

1. **Clone or download** the repository.
2. **Open** `heighway-area.html` in your browser (no server required).
3. **Select a mode** using the tabs:
   - **Squares** — See the square construction and area proof
   - **Tiling** — See how 4 rotated copies tile the plane (total area = 2)
   - **Curve** — View the pure dragon curve with boundary detection
4. **Adjust the iteration depth** with the slider.
5. **Customize colors** and toggle overlays to explore different visualizations.
6. **Click "Download SVG"** to save your current view.

---

## Mathematical Background

### Rectangle Construction

The dragon is generated via the classic paper-folding sequence:
- Start with `[1]`
- At each step, append `1`, then mirror the previous sequence swapping `1 ↔ 0`
- `1` = turn left (90°), `0` = turn right (90°)

Walking the curve and pairing consecutive segments produces squares that progressively fill the dragon's interior.

### Tiling the Plane

The squares from any single iteration can tile the entire plane using 4 rotated copies (0°, 90°, 180°, 270°), just as the dragon curve itself tiles the plane. Four copies × area ½ = total area **2** per fundamental domain, confirming the tiling fills space exactly.

### Why Area = ½

As k → ∞, both the dragon and the square approximations tile the plane. The dragon's area equals the limit of Aₖ = ½. Equivalently, the 2 IFS (Iterated Function System) maps each scale by 1/√2, so 2 × (1/√2)² = 1, giving area = 1/(2×1) = ½.

---

## Technical Details

- **Pure vanilla JavaScript** — no dependencies or build step required
- **Exact integer grid** — all dragon vertices are computed on a doubled integer lattice to avoid floating-point drift
- **Boundary detection** — boundary edges are found by counting shared segments and chaining the unique perimeter edges
- **SVG rendering** — lightweight, scalable vector output

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). No external libraries or internet connection required after download.

---

## License

MIT License — feel free to use, modify, and share.

---

*Built as an interactive exploration of fractal geometry and the surprising fact that a space-filling curve can have a perfectly constant, finite area.*
