/* script.js
 - Canvas petals optimized
 - Autoplay strategy: start muted play, then try to unmute & fade-in
*/

const audio = document.getElementById('bgAudio');

// --- AUDIO: autoplay muted -> try unmute + fade in ---
function tryAutoPlayAndFade() {
  // start muted playback (most browsers allow autoplay when muted)
  audio.muted = true;
  audio.volume = 0;
  const p = audio.play();

  if (p !== undefined) {
    p.then(() => {
      // start fade-in attempt after a short delay
      setTimeout(() => {
        // try to unmute and fade in gradually
        // Some browsers may still block unmute; we catch that error
        try {
          audio.muted = false;
          fadeInAudio(0.02, 50); // step, interval(ms)
        } catch(err) {
          // If browser blocks unmute, leave muted and wait for user's first gesture
          console.warn('Could not unmute automatically:', err);
          awaitUserGestureToUnmute();
        }
      }, 600); // small delay so playback is "established"
    }).catch(err => {
      console.warn('Autoplay failed:', err);
      // If play() rejected, wait for user interaction to start audio
      awaitUserGestureToUnmute();
    });
  } else {
    // fallback
    awaitUserGestureToUnmute();
  }
}

function fadeInAudio(step = 0.02, interval = 100) {
  // fade to target volume 0.8 smoothly
  const target = 0.8;
  let vol = audio.volume;
  const id = setInterval(() => {
    vol = Math.min(target, vol + step);
    audio.volume = vol;
    if (vol >= target) clearInterval(id);
  }, interval);
}

function awaitUserGestureToUnmute() {
  function onGesture() {
    audio.muted = false;
    audio.play().catch(e => console.warn('Play after gesture failed', e));
    fadeInAudio(0.03, 60);
    window.removeEventListener('pointerdown', onGesture);
    window.removeEventListener('keydown', onGesture);
  }
  window.addEventListener('pointerdown', onGesture, { once: true });
  window.addEventListener('keydown', onGesture, { once: true });
}

// Call autoplay routine
window.addEventListener('load', tryAutoPlayAndFade);

/* ----------------------------
   PETAL (flower) CANVAS EFFECT
   - lightweight particle system
   ---------------------------- */
const canvas = document.getElementById('petalCanvas');
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

function rand(min, max) { return Math.random() * (max - min) + min; }

// create petal shapes cached as canvas for performance
function createPetalImage() {
  const c = document.createElement('canvas');
  c.width = 60; c.height = 60;
  const g = c.getContext('2d');

  // gradient fill
  const grad = g.createLinearGradient(0, 0, 60, 60);
  grad.addColorStop(0, '#ffb3c7');
  grad.addColorStop(0.6, '#ff8fb0');
  grad.addColorStop(1, '#ffd6e3');

  g.translate(30, 30);
  g.rotate(Math.PI / 6);
  g.beginPath();
  g.moveTo(0, -12);
  g.bezierCurveTo(10, -28, 28, -28, 32, -12);
  g.bezierCurveTo(28, 4, 10, 16, 0, 32);
  g.bezierCurveTo(-10, 16, -28, 4, -32, -12);
  g.bezierCurveTo(-28, -28, -10, -28, 0, -12);
  g.closePath();
  g.fillStyle = grad;
  g.fill();
  g.globalAlpha = 0.9;
  return c;
}
const petalImg = createPetalImage();

class Petal {
  constructor() {
    this.reset(true);
  }
  reset(init=false) {
    this.x = rand(0, window.innerWidth);
    this.y = init ? rand(-200, window.innerHeight) : rand(-120, -40);
    this.size = rand(0.6, 1.4);
    this.speedY = rand(0.3, 1.6);
    this.speedX = rand(-0.6, 0.6);
    this.rotation = rand(0, Math.PI*2);
    this.rotSpeed = rand(-0.02, 0.02);
    this.opacity = rand(0.6, 1);
    this.tilt = rand(-0.5, 0.5);
    this.swing = rand(20, 80);
    this.phase = rand(0, Math.PI*2);
  }
  update(dt) {
    this.phase += dt * 0.002 * rand(0.8,1.2);
    this.x += Math.sin(this.phase) * 0.4 + this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotSpeed;
    if (this.y > window.innerHeight + 60 || this.x < -60 || this.x > window.innerWidth + 60) this.reset();
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.size, this.size);
    // draw cached petal image centered
    ctx.drawImage(petalImg, -petalImg.width/2, -petalImg.height/2);
    ctx.restore();
  }
}

con
