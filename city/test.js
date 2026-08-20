const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
const width = 2000;
const height = 1000;

canvas.width = width;
canvas.height = height;

let time = 0;

const nightSky = {r:0, g:0, b:0};
const daySky = {r:0, g:153, b:255};

function getSkyColor() {
  const brightness = (Math.sin(time) + 1) / 2;

  const r = Math.floor(nightSky.r + brightness * (daySky.r - nightSky.r));
  const g = Math.floor(nightSky.g + brightness * (daySky.g - nightSky.g));
  const b = Math.floor(nightSky.b + brightness * (daySky.b - nightSky.b));

  return `rgb(r, ${g}, ${b})`;
}

ctx.fillRect(0, 0, canvas.width, canvas.height);