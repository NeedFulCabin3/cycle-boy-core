const cpu = new CPU();
const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const logBox = document.getElementById('log');
const regView = document.getElementById('regView');

let running = false;
let runTimer = null;

function log(msg) {
  logBox.textContent += msg + '\n';
  logBox.scrollTop = logBox.scrollHeight;
}

function hex(n, len = 2) {
  return n.toString(16).toUpperCase().padStart(len, '0');
}

function updateRegisters() {
  regView.innerHTML = `
    <div>A: ${hex(cpu.a)}</div>
    <div>F: ${hex(cpu.f)}</div>
    <div>B: ${hex(cpu.b)}</div>
    <div>C: ${hex(cpu.c)}</div>
    <div>D: ${hex(cpu.d)}</div>
    <div>E: ${hex(cpu.e)}</div>
    <div>H: ${hex(cpu.h)}</div>
    <div>L: ${hex(cpu.l)}</div>
    <div>SP: ${hex(cpu.sp, 4)}</div>
    <div>PC: ${hex(cpu.pc, 4)}</div>
    <div>Z: ${cpu.flagZ}</div>
    <div>C flag: ${cpu.flagC}</div>
  `;
}

// pulls 2bpp tile data out of vram and paints it to the canvas
// each tile is 8x8px, 16 bytes, 2 bits per pixel gives us 4 shades
function renderScreen() {
  const shades = ['#c9d6a4', '#8fa66a', '#4f6b3a', '#25311c'];
  const tileDataBase = 0x8000;
  const tileMapBase = 0x9800;
  const tilesPerRow = 20;
  const tileRows = 18;

  for (let ty = 0; ty < tileRows; ty++) {
    for (let tx = 0; tx < tilesPerRow; tx++) {
      const mapIndex = ty * 32 + tx; // gb background map is 32 tiles wide
      const tileId = cpu.mem[tileMapBase + mapIndex];
      const tileAddr = tileDataBase + tileId * 16;

      for (let row = 0; row < 8; row++) {
        const lo = cpu.mem[tileAddr + row * 2];
        const hi = cpu.mem[tileAddr + row * 2 + 1];

        for (let bit = 0; bit < 8; bit++) {
          const loBit = (lo >> (7 - bit)) & 1;
          const hiBit = (hi >> (7 - bit)) & 1;
          const colorIndex = (hiBit << 1) | loBit;

          ctx.fillStyle = shades[colorIndex];
          ctx.fillRect(tx * 8 + bit, ty * 8 + row, 1, 1);
        }
      }
    }
  }
}

function stepOnce() {
  const result = cpu.step();
  log(result);
  updateRegisters();
  renderScreen();
  if (cpu.halted && running) {
    stopRun();
    log('cpu halted, stopping run');
  }
}

function stopRun() {
  running = false;
  clearInterval(runTimer);
}

document.getElementById('stepBtn').addEventListener('click', stepOnce);

document.getElementById('runBtn').addEventListener('click', () => {
  if (running) return;
  running = true;
  runTimer = setInterval(() => {
    if (!running || cpu.halted) { stopRun(); return; }
    for (let i = 0; i < 50 && !cpu.halted; i++) cpu.step();
    updateRegisters();
    renderScreen();
  }, 16);
});

document.getElementById('pauseBtn').addEventListener('click', stopRun);

document.getElementById('resetBtn').addEventListener('click', () => {
  stopRun();
  cpu.reset();
  logBox.textContent = '';
  updateRegisters();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  log('cpu reset');
});

document.getElementById('romInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const bytes = new Uint8Array(reader.result);
    cpu.reset();
    cpu.loadRom(bytes);
    log(`loaded rom "${file.name}" (${bytes.length} bytes)`);
    updateRegisters();
  };
  reader.readAsArrayBuffer(file);
});

// stick a tiny built-in test program at 0x100 so there's something to step through
// even without loading a real rom file
function loadDemoProgram() {
  const program = [
    0x3E, 0x05,       // LD A, 5
    0x06, 0x03,       // LD B, 3
    0x80,             // ADD A,B
    0x3D,             // DEC A
    0x20, 0xFD,       // JR NZ, -3 (loops back to DEC A)
    0x76              // HALT
  ];
  cpu.mem.set(program, 0x100);
  log('demo program loaded at 0x100, hit step or run');
}

loadDemoProgram();
updateRegisters();
