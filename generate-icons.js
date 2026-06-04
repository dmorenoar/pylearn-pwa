const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "public/icons");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const r = size * 0.12;

  // Background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#161b22");
  grad.addColorStop(1, "#0d1117");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Snake emoji substitute: draw a Python-ish snake symbol
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 192;

  // Green circle (head)
  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.arc(cx - 18 * scale, cy - 10 * scale, 28 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Blue circle (body)
  ctx.fillStyle = "#60a5fa";
  ctx.beginPath();
  ctx.arc(cx + 18 * scale, cy + 10 * scale, 28 * scale, 0, Math.PI * 2);
  ctx.fill();

  // White text "Py"
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(36 * scale)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Py", cx, cy);

  return canvas.toBuffer("image/png");
}

[192, 512].forEach((size) => {
  const buf = drawIcon(size);
  fs.writeFileSync(path.join(dir, `icon-${size}.png`), buf);
  console.log(`Generated icon-${size}.png`);
});
