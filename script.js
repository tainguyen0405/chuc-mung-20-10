// script.js - aggressive autoplay strategy + petal canvas kept intact

/* -------- AUDIO AUTO-PLAY / UNMUTE STRATEGY --------
  Steps:
   1) Start audio element muted and play (muted autoplay usually allowed).
   2) After a short delay try to set muted=false and fade volume in.
   3) If blocked, retry unmute periodically and on focus/visibility events.
   4) Keep retrying for a limited time (e.g. 20s) to maximize chance.
*/

const audio = document.getElementById('bgAudio');
const MAX_RETRY_MS = 20000;    // total retry window
const RETRY_INTERVAL = 600;    // ms between attempts
const FADE_STEP = 0.03;
const FADE_INTERVAL = 80;
let startTime = null;
let retryTimer = null;

function fadeInAudio(target = 0.8, step = FADE_STEP, interval = FADE_INTERVAL) {
  audio.volume = audio.volume || 0;
  const id = setInterval(() => {
    audio.volume = Math.min(target, audio.volume + step);
    if (audio.volume >= target) clearInterval(id);
  }, interval);
}

function tryUnmuteOnce() {
  // try to unmute + play
  try {
    audio.muted = false;
    const p = audio.play();
    if (p && p.then) {
      p.then(() => {
        // started playing with sound
        fadeInAudio();
        clearRetry();
      }).catch(err => {
        // blocked - keep audio muted and return false
        audio.muted = true;
        // console for debug
        console.warn('Unmute attempt blocked:', err);
      });
    } else {
      // older browsers may not return promise - assume success if not throwing
      fadeInAudio();
      clearRetry();
    }
  } catch (e) {
    // if any exception, revert to muted
    audio.muted = true;
    console.warn('Unmute attempt error:', e);
  }
}

function clearRetry() {
  if (retryTimer) { clearInterval(retryTimer); retryTimer = null; }
}

// Start initial muted autoplay
function startMutedPlay() {
  audio.muted = true;
  audio.volume = 0;
  const p = audio.play();
  if (p && p.catch) {
    p.catch(err => {
      console.warn('Initial autoplay (muted) failed:', err);
      // nothing else we can do until a gesture or focus/visibility change
    });
  }
}

// Start retry loop which attempts unmute periodically until timeout
function startRetryUnmute() {
  if (retryTimer) return;
  startTime = Date.now();
  retryTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    if (elapsed > MAX_RETRY_MS) {
      clearRetry();
      console.log('Giving up automatic unmute after retry window.');
      return;
    }
    tryUnmuteOnce();
  }, RETRY_INTERVAL);
}

// Try immediate unmute after short delay (improves chance in some browsers)
window.addEventListener('load', () => {
  startMutedPlay();
  // try to unmute shortly after start (some browsers allow)
  setTimeout(() => {
    tryUnmuteOnce();
    // if blocked, start periodic retry & listen to focus/visibility to retry again
    startRetryUnmute();
  }, 600); // small delay gives play() a chance to "establish"
});

// If user switches tabs / focuses back, try again (no explicit click required)
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    tryUnmuteOnce();
    startRetryUnmute();
  }
});
window.addEventListener('focus', () => {
  tryUnmuteOnce();
  startRetryUnmute();
});

// Optional: listen for pointer/key events anywhere (these are gestures, but we won't show a button)
window.addEventListener('pointerdown', () => {
  // If browser requires gesture, this will usually allow unmute.
  tryUnmuteOnce();
  clearRetry();
}, { once: true });
window.addEventListener('keydown', () => {
  tryUnmuteOnce();
  clearRetry();
}, { once: true });

/* -------- PETAL CANVAS (kept from previous version) -------- */
const canvas = document.getElementById('petalCanvas');
const ctx = canvas.getContext('2d');
function fitCanvas(){
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', fitCanvas);
fitCanvas();
function rand(min,max){ return Math.random()*(max-min)+min; }
function createPetalImg(){
  const c = document.createElement('canvas');
  c.width = 90; c.height = 90;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0,0,90,90);
  grad.addColorStop(0,'#ffd6e3'); grad.addColorStop(0.6,'#ff8fb0'); grad.addColorStop(1,'#ffc7d7');
  g.translate(45,45); g.rotate(Math.PI/10);
  g.beginPath();
  g.moveTo(0,-18);
  g.bezierCurveTo(14,-38,36,-38,42,-18);
  g.bezierCurveTo(36,6,14,20,0,42);
  g.bezierCurveTo(-14,20,-36,6,-42,-18);
  g.bezierCurveTo(-36,-38,-14,-38,0,-18);
  g.closePath(); g.fillStyle = grad; g.fill();
  return c;
}
const petalImg = createPetalImg();
class Petal {
  constructor(init){ this.reset(init); }
  reset(init=false){
    this.x = rand(-150, window.innerWidth+150);
    this.y = init ? rand(0, window.innerHeight) : rand(-250, -50);
    this.size = rand(0.5, 1.6);
    this.speedY = rand(0.3, 1.8);
    this.speedX = rand(-0.9, 0.9);
    this.rotation = rand(0, Math.PI*2);
    this.rotSpeed = rand(-0.02, 0.02);
    this.opacity = rand(0.6, 1);
    this.phase = rand(0, Math.PI*2);
    this.swing = rand(12, 90);
  }
  update(dt){
    this.phase += dt * 0.002 * rand(0.9,1.1);
    this.x += Math.sin(this.phase) * (this.swing/40) * 0.4 + this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotSpeed;
    if (this.y > window.innerHeight + 80 || this.x < -200 || this.x > window.innerWidth + 200) this.reset();
  }
  draw(ctx){
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.size, this.size);
    ctx.drawImage(petalImg, -petalImg.width/2, -petalImg.height/2);
    ctx.restore();
  }
}
const PETAL_COUNT = Math.min(120, Math.max(30, Math.floor(window.innerWidth / 14)));
const petals = Array.from({length: PETAL_COUNT}, ()=> new Petal(true));
let last = performance.now();
function animate(now){
  const dt = now - last; last = now;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (let p of petals){ p.update(dt); p.draw(ctx); }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
