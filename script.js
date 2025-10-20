// --- Music handling (autoplay strategy) ---
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');

// 1) Attempt: play muted automatically so browsers allow it
music.muted = true;
music.play().catch(()=>{ /* ignore */ });

// 2) After load, try to unmute on first user interaction
function enableSoundAndPlay() {
  // unmute and play if paused
  try {
    music.muted = false;
    music.volume = 0.95;
    music.play().catch(()=>{ /* could be blocked */ });
    // change icon to "playing"
    musicIcon.src = "https://cdn-icons-png.flaticon.com/512/727/727245.png";
    // remove the one-time listener after use
    window.removeEventListener('pointerdown', enableSoundAndPlay);
    window.removeEventListener('keydown', enableSoundAndPlay);
  } catch(e) {
    // ignore
  }
}

// Listen for user interaction to unmute (works on mobile & desktop)
window.addEventListener('pointerdown', enableSoundAndPlay, { once: true });
window.addEventListener('keydown', enableSoundAndPlay, { once: true });

// Music button toggles play/pause (and unmute if necessary)
musicBtn.addEventListener('click', () => {
  if (music.paused) {
    music.muted = false; // ensure audible
    music.play().catch(()=>{ /* if blocked */ });
    musicIcon.src = "https://cdn-icons-png.flaticon.com/512/727/727245.png"; // playing icon
  } else {
    music.pause();
    musicIcon.src = "https://cdn-icons-png.flaticon.com/512/727/727240.png"; // paused icon
  }
});

// --- Canvas animation: floating hearts (behind content) ---
const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function rand(min,max){ return Math.random()*(max-min)+min; }

class Heart {
  constructor(){
    this.reset();
  }
  reset(){
    this.x = rand(0, canvas.width);
    this.y = rand(canvas.height*0.6, canvas.height + 100);
    this.size = rand(8, 26);
    this.speed = rand(0.6, 2.2);
    this.color = `hsl(${rand(320,350)},70%,60%)`;
    this.twist = rand(0, Math.PI*2);
  }
  update(){
    this.y -= this.speed;
    this.x += Math.sin(this.y/30 + this.twist) * 0.6;
    if (this.y < -50) this.reset();
  }
  draw(){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.size/20, this.size/20);
    ctx.beginPath();
    // simple heart path
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -3, -5, -15, -15, -15);
    ctx.bezierCurveTo(-35, -15, -35, 10, -35, 10);
    ctx.bezierCurveTo(-35, 25, -15, 45, 0, 60);
    ctx.bezierCurveTo(15, 45, 35, 25, 35, 10);
    ctx.bezierCurveTo(35, 10, 35, -15, 15, -15);
    ctx.bezierCurveTo(5, -15, 0, -3, 0, 0);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

const hearts = [];
for(let i=0;i<60;i++) hearts.push(new Heart());

function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // slight translucent overlay to create depth
  ctx.globalAlpha = 0.95;
  hearts.forEach(h=>{
    h.update();
    h.draw();
  });
  requestAnimationFrame(loop);
}
loop();
