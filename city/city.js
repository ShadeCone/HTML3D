const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
const width = 1000;
const height = 1000;

canvas.width = width;
canvas.height = height;

//---------adjust time speed scaler----------------------
let time = 0;
const timeSpeedScaler = 0.5;
const timeSpeed = 0.005*timeSpeedScaler;
//-------------------------------------------------------

const nightSky = {r:0, g:0, b:0};
const daySky = {r:0, g:153, b:255};

//camera
const cam_pos = [0, 2, 0];//x y z
let cam_dir = [0, 0, 0];//x y z, default +z axis, measured relative to default direction
let theta = 0;
let phi = 0;
const fov = 700;

//information
const textStyle = '#66ff66';
const showInfo = 1;

//movement
const inputKeys = {w:false, a:false, s:false, d:false, ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false};

const moveSpeed = 0.1;
const dirSpeed = 0.01;

window.addEventListener('keydown', event => {
  if (event.key in inputKeys) inputKeys[event.key] = true;
  const lower = event.key.toLowerCase();
  if (lower in inputKeys) inputKeys[lower] = true;
});
window.addEventListener('keyup', event => {
  if (event.key in inputKeys) inputKeys[event.key] = false;
  const lower = event.key.toLowerCase();
  if (lower in inputKeys) inputKeys[lower] = false;
});

function updatePos(inputKeys) {
  const fb = inputKeys.w - inputKeys.s;
  const rl = inputKeys.d - inputKeys.a;
  const costheta = Math.cos(theta);
  const sintheta = Math.sin(theta);
  if (Math.abs(fb) && Math.abs(rl)) {
    cam_pos[0] += moveSpeed/Math.sqrt(2)*(-fb*sintheta + rl*costheta); // dx
    cam_pos[2] += moveSpeed/Math.sqrt(2)*(fb*costheta + rl*sintheta); // dz
  }
  else {
  cam_pos[0] += moveSpeed*(-fb*sintheta + rl*costheta);
  cam_pos[2] += moveSpeed*(fb*costheta + rl*sintheta);
  };
}

function updateDir(inputKeys) {
  const ud = inputKeys.ArrowUp - inputKeys.ArrowDown;
  const lr = inputKeys.ArrowLeft - inputKeys.ArrowRight;
  const cosphi = Math.cos(phi)
  if ((phi + dirSpeed*ud < Math.PI/2 - 0.05) && (phi + dirSpeed*ud > -Math.PI/2 + 0.05)) {
    phi += dirSpeed*ud;
  };
  theta = (theta + dirSpeed*lr) % (2*Math.PI);
  cam_dir[0] = -cosphi*Math.sin(theta);
  cam_dir[1] = Math.sin(phi);
  cam_dir[2] = cosphi*Math.cos(theta);
}

//objects
function setOriginToCam({x, y, z}) {
  const x1 = x - cam_pos[0];
  const y1 = y - cam_pos[1];
  const z1 = z - cam_pos[2];
  return {x1, y1, z1};
}
function rotateXZ({x1, y1, z1}) {
  const costheta = Math.cos(theta);
  const sintheta = Math.sin(theta);
  const x2 = x1*costheta + z1*sintheta;
  const y2 = y1;
  const z2 = z1*costheta - x1*sintheta;
  return {x2, y2, z2};
}
function rotateYZ({x2, y2, z2}) {
  const cosphi = Math.cos(phi);
  const sinphi = Math.sin(phi);
  const x3 = x2;
  const y3 = y2*cosphi - z2*sinphi;
  const z3 = y2*sinphi + z2*cosphi;
  return {x3, y3, z3};
}

//rendering
function project(point) {
  const p1 = setOriginToCam(point);
  const p2 = rotateXZ(p1);
  const p3 = rotateYZ(p2);

  if (p3.z3 <= 0.1) return null;

  const screenX = (width/2) + (p3.x3/p3.z3) * fov;
  const screenY = (height/2) - (p3.y3/p3.z3) * fov;

  return [screenX, screenY];
}
//background
function getSkyColor() {
  const brightness = (Math.sin(time*2*Math.PI - Math.PI/2) + 1) / 2;

  const r = Math.floor(nightSky.r + brightness * (daySky.r - nightSky.r));
  const g = Math.floor(nightSky.g + brightness * (daySky.g - nightSky.g));
  const b = Math.floor(nightSky.b + brightness * (daySky.b - nightSky.b));

  return `rgb(${r}, ${g}, ${b})`;
}



//test values
const vs = [{x:0, y:5, z:0}];


function loop() {
  //background
  ctx.fillStyle = getSkyColor();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //information
  ctx.fillStyle = textStyle;
  ctx.font = 'bold 16px monospace';
  if (showInfo) {
    ctx.fillText(`Time: ${time.toFixed(1)} | Cycle: ${(Math.sin(time) > 0 ? 'Day' : 'Night')}`, 20, 30);
    ctx.fillText(`Camera Position: x:${cam_pos[0].toFixed(2)} y:${cam_pos[1].toFixed(2)} z:${cam_pos[2].toFixed(2)}`, 20, 60);
      ctx.fillText(`Camera Direction: x:${cam_dir[0].toFixed(2)} y:${cam_dir[1].toFixed(2)} z:${cam_dir[2].toFixed(2)}`, 20, 90);
    ctx.fillText(`Inputs: W:${inputKeys.w} A:${inputKeys.a} S:${inputKeys.s} D:${inputKeys.d}`, 20, 120);
    ctx.fillText(`Inputs: Up:${inputKeys.ArrowUp} Down:${inputKeys.ArrowDown} Left:${inputKeys.ArrowLeft} Right:${inputKeys.ArrowRight}`, 20, 150);
    ctx.fillText(`theta: ${(theta*180/Math.PI).toFixed(2)}\u00B0 phi: ${phi.toFixed(2)}`, 20, 180);
  };
  
  //ground
  const projPlane = groundPlane.map(p => project(p));

  if (projPlane.every(p => p !== null)) {
    ctx.fillStyle = '#228b22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(projPlane[0][0], projPlane[0][1]);
    for (let i = 1; i < projPlane.length; i++) {
      ctx.lineTo(projPlane[i][0], projPlane[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  else ctx.fillText("plane error", 20, 400);
  //objects
  for (const v of vs) {
    ctx.fillText(`point location: ${v.x} ${v.y} ${v.z}`, 40, 210);
    //const temp1 = setOriginToCam(v);
    //ctx.fillText(`${temp1.x1.toFixed(2)} ${temp1.y1.toFixed(2)} ${temp1.z1.toFixed(2)}`, 40, 240);
    //const temp2 = rotateXZ(temp1);
    //ctx.fillText(`${temp2.x2.toFixed(2)} ${temp2.y2.toFixed(2)} ${temp2.z2.toFixed(2)}`, 80, 270);
    //const temp3 = rotateYZ(temp2);
    //ctx.fillText(`${temp3.x3.toFixed(2)} ${temp3.y3.toFixed(2)} ${temp3.z3.toFixed(2)}`, 80, 300);

    //rendering
    const screenPos = project(v);
    if (screenPos) {
      ctx.fillStyle = '#33cccc';
      ctx.beginPath();
      ctx.arc(screenPos[0], screenPos[1], 8, 0, Math.PI*2);
      ctx.fill();
    }
  }

  //movement
  updatePos(inputKeys);
  updateDir(inputKeys);

  requestAnimationFrame(loop);
  
  time += timeSpeed;
  if (time > 4) {
    //close();
  }
}

loop();