const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
const width = 2000;
const height = 1000;

canvas.width = width;
canvas.height = height;

let time = 0;
const timeSpeed = 0.005;

const nightSky = {r:0, g:0, b:0};
const daySky = {r:0, g:153, b:255};

//camera
const cam_pos = [0, 0, 0];
let cam_dir = [0, 0, 0]; //positive x axis direction is default

//information
const textStyle = '#66ff66'

//movement
const isKeyDown = Array(255).fill(false);
onkeydown = onkeyup = (e) => {
  isKeyDown[e.keyCode] = e.type === "keydown";
};

function getSkyColor() {
  const brightness = (Math.sin(time*2*Math.PI - Math.PI/2) + 1) / 2;

  const r = Math.floor(nightSky.r + brightness * (daySky.r - nightSky.r));
  const g = Math.floor(nightSky.g + brightness * (daySky.g - nightSky.g));
  const b = Math.floor(nightSky.b + brightness * (daySky.b - nightSky.b));

  return `rgb(${r}, ${g}, ${b})`;
}

function loop() {
  //background
  ctx.fillStyle = getSkyColor();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //information
  ctx.fillStyle = textStyle;
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`Time: ${time.toFixed(2)} | Cycle: ${(Math.sin(time) > 0 ? 'Day' : 'Night')}`, 20, 30);
  ctx.fillText(`x:${cam_pos[0]} y:${cam_pos[1]} z:${cam_pos[2]}`, 20, 60);
  
  requestAnimationFrame(loop);
  
  time += timeSpeed;
  if (time > 4) {
    //close();
  }
}

loop();