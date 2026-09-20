# Cycle Boy Core

An instruction-level Game Boy system simulator and tile canvas renderer running inside browser execution contexts.

## Overview
`cycle-boy-core` implements an 8-bit instruction processing unit coupled to a 64KB memory map and a 2-bits-per-pixel background tile engine. It parses loaded ROM binary arrays directly, step-by-step or inside an execution loop, updating hardware register representations and drawing graphics directly to an HTML5 canvas element without third-party frameworks.

## How It Works
1. **Instruction Fetch & Decode:** The system reads bytes sequentially starting from the program counter (`PC`), matching operation codes to specific register manipulations or memory reads/writes.
2. **Memory Map Allocation:** RAM spans 64KB, holding lower bank code space, tile data arrays (`0x8000`), background map tables (`0x9800`), and stack space.
3. **Tile Array Parsing:** Every 16 bytes inside tile data memory form an 8x8 pixel tile grid using 2-bit planes. The rendering loop combines these bitplanes into four distinct palette shades.
4. **Execution Loop:** An asynchronous loop triggers execution batches (50 steps per tick) via `setInterval`, matching regular frame updates to display pixel state changes.

## Key Features
* Custom 8-bit register state tracking (`A`, `F`, `B`, `C`, `D`, `E`, `H`, `L`, `SP`, `PC`).
* Real-time 2BPP tile map canvas visualizer supporting $160 \times 144$ native resolution scaled up $2\times$.
* Built-in fallback boot test program loaded at memory address `0x100`.
* FileReader integration for loading local `.gb` ROM binaries directly through web forms.
* Single-step instruction stepping alongside execution pause/reset capabilities.

## Tech Stack Breakdown
* **JavaScript (ES6+):** Pure execution logic, TypedArrays (`Uint8Array`), binary masking, and bit-shift operators.
* **HTML5 Canvas:** Low-level $2\times$ pixel scaling rendering with CSS pixelated scaling modes.
* **CSS3:** Flexible box display grid and custom styled controls.

## Prerequisites & Web-Based Quick Start

### Browser-Based Execution (GitHub Codespaces)
1. Press `.` on your keyboard inside this repo page (or launch a GitHub Codespace).
2. Install the **Live Preview** extension inside the web editor.
3. Right-click `index.html` and select **Live Preview: Show Preview**.

### Local Setup
1. Clone or download the source files.
2. Open `index.html` in any browser supporting HTML5 canvas and ES6 classes.

## Project Structure

```text
cycle-boy-core/
├── index.html           # Document structure, UI panels, and layout
├── style.css            # Custom theme styles, register grids, canvas borders
├── app.js               # Canvas renderer, DOM events, UI update bindings
└── cpu.js               # CPU register state machine and instruction set logic
```

## Roadmap

Add missing instruction sub-sets, half-carry flags, and ALU arithmetic operations.

Implement LCD status register (STAT) and scanline timer interrupts (LY/LYC).

Support sprite visual layer rendering (OAM table lookup).

Add audio processing channel square/wave generator support using Web Audio API.