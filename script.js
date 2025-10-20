/* script.js
  - aggressive autoplay attempt (muted autoplay -> try unmute & fade-in -> retry on focus/visibility)
  - petal canvas with depth/parallax & rotation
  - sparkle canvas for cinematic particles
  - shows tiny hint only if unmute fails after retries
*/

// ---------- AUDIO: aggressive autoplay + fade-in ----------
const audio = document.getElementById('bgAudio');
const hint = document.getElementById('hintTap');

// Set initial low volume
audio.volume = 0;

// Start muted play (browsers generally allow muted autoplay)
function startMutedPlay() {
  audio.muted = true;
  audio.volume = 0;
  const p = audio.play();
  if (p && p.catch) {
    p.catch(err => console.warn('Muted autoplay blocked:', err));
  }
}

// Try to unmute & fade-in once; returns true if unmute succeeded (promise resolved)
function tryUnmuteAndFade() {
  try {
    audio.muted = false;
    const p = audio.play();
    if (!p) { // older browsers
      fadeIn(0.02);
      hideHint();
      return Promise.resolve(true);
    }
    return p.then(()=> { fadeIn(0.02); hideHint(); return true; })
            .catch(err => { audio.muted = true; console.warn('Unmute blocked:', err); return false; });
  } catch(e) {
    console.warn('unmute error', e);
    audio.muted = true;
    return Promise.resolve(false);
  }
}

function fadeIn(step=0.02, interval=80, target=0.85) {
  clearInterval(window._fadeInterval);
  window._fadeInterval = setInterval(()=> {
    const v = Math.min(target, audio.volume + step);
    audio.volume = v;
    if (v >= target) clearInterval(window._fadeInterval);
  }, interval);
}

let retryInterval = null;
function startRetryLoop(timeout=20000, interval=700) {
  const start = Date.now();
  if (retryInterval) return;
  retryInterval = setInterval(async () => {
    if (Date.now() - start > timeout) {
      clearInterval(retryInterval);
      retryInterval = null;
      showHint(); // if still blocked, show small hint
      return;
    }
    const ok = await tryUnmuteAndFade();
    if (ok) { clearInterval(retryInterval); retryInterval = null; }
  }, interval);
}

// show/hide tiny hint
function showHint() { hint.style.display = 'block'; }
function hideHint() { hint.style.display = 'none'; }

// If user taps, definitely enable sound (gesture)
hint.addEventListener('pointerdown', async () => {
  await tryUnmuteAndFade();
  hideHint();
}, { once: true });

// Start process on load
window.addEventListener('load', () => {
  startMutedPlay();
  // quick attempt to unmute a moment after start
  setTimeout(async () => {
    const ok = await tryUnmuteAndFade();
    if (!ok) startRetryLoop(); // if blocked, start retry loop
  }, 600);
});

// Also retry when tab becomes visible or window gains focus
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { tryUnmuteAndFade().then(ok=>{ if(!ok) startRetryLoop(); }); }
});
window.addEventListener('focus', () => { tryUnmuteAndFade().then(ok=>{ if(!ok) startRetryLoop(); }); });

// Also consider a first gesture anywhere to unmute (most browsers will allow)
window.addEventListener('pointerdown', async function onceGesture(){
  await tryUnmuteAndFade();
  window.removeEventListener('pointerdown', onceGesture);
}, { once: true });

window.addEventListener('keydown', async function onceKey(){
  await tryUnmuteAndFade();
  window.removeEventListener('keydown', onceKey);
}, { once: true });

// ------------------ PETAL CANVAS (depth + parallax) ------------------
const petalCanvas = document.getElementById('petalCanvas');
const pctx = petalCanvas.getContext('2d');

function resizeCanvas(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas(petalCanvas, pctx);
window.addEventListener('resize', ()=> resizeCanvas(petalCanvas,pctx));

function rand(min,max){ return Math.random()*(max-min)+min; }

// Create petal image cache for performance
function createPetalCache(){
  const c = document.createElement('canvas'), g = c.getContext('2d');
  c.width = 120; c.height = 120;
  const grad = g.createLinearGradient(0,0,120,120);
  grad.addColorStop(0,'#fff1f5'); grad.addColorStop(0.6,'#ffb3cf'); grad.addColorStop(1,'#ffc7d7');
  g.translate(60,60); g.rotate(Math.PI/10);
  g.beginPath();
  g.moveTo(0,-26); g.bezierCurveTo(18,-54,46,-54,54,-26);
  g.bezierCurveTo(46,8,18,36,0,74); g.bezierCurveTo(-18,36,-46,8,-54,-26);
  g.bezierCurveTo(-46,-54,-18,-54,0,-26); g.closePath();
  g.fillStyle = grad; g.fill();
  return c;
}
const petalImg = createPetalCache();

class Petal {
  constructor(depth){
    this.depth = depth; // used to scale speed/size/parallax
    this.reset(true);
  }
  reset(init=false){
    this.x = rand(-200, window.innerWidth+200);
    this.y = init ? rand(-200, window.innerHeight) : rand(-300, -50);
    this.size = rand(0.5, 1.6) * (1 + (1-this.depth)*0.6);
    this.speedY = rand(0.3, 1.6) * (1 + (1-this.depth));
    this.speedX = rand(-0.6, 0.6)*(0.6 + (1-this.depth));
    this.rotation = rand(0, Math.PI*2);
    this.rotSpeed = rand(-0.01, 0.01)*(1+(1-this.depth));
    this.opacity = rand(0.5, 1) * (0.6 + this.depth*0.4);
    this.phase = rand(0, Math.PI*2);
    this.swing = rand(12, 80);
  }
  update(dt){
    this.phase += dt * 0.002 * (0.6 + (1-this.depth)*0.6);
    this.x += Math.sin(this.phase) * (this.swing/40) * 0.35 * (1+ (1-this.depth)*0.4) + this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotSpeed;
    if (this.y > window.innerHeight + 100 || this.x < -300 || this.x > window.innerWidth + 300) this.reset();
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

// create layered petals with depth (0.2 .. 1)
const layers = [
  {depth:0.25, count: Math.floor(window.innerWidth/40)}, // far, small, slow
  {depth:0.55, count: Math.floor(window.innerWidth/28)},
  {depth:0.9,  count: Math.floor(window.innerWidth/18)}  // near, bigger, faster
];
const petals = [];
layers.forEach(layer => {
  for(let i=0;i<layer.count;i++) petals.push(new Petal(layer.depth));
});

let last = performance.now();
function animatePetals(now){
  const dt = now - last; last = now;
  pctx.clearRect(0,0,petalCanvas.width, petalCanvas.height);
  petals.forEach(p => { p.update(dt); p.draw(pctx); });
  requestAnimationFrame(animatePetals);
}
requestAnimationFrame(animatePetals);

// -------------- SPARKLE LAYER (soft cinematic light) --------------
const sparkleCanvas = document.getElementById('sparkleCanvas');
const sctx = sparkleCanvas.getContext('2d');
resizeCanvas(sparkleCanvas, sctx);
window.addEventListener('resize', ()=> resizeCanvas(sparkleCanvas,sctx));

class Spark {
  constructor(){
    this.reset();
  }
  reset(){
    this.x = rand(0, window.innerWidth);
    this.y = rand(0, window.innerHeight);
    this.r = rand(1,5);
    this.alpha = rand(0.05,0.25);
    this.speed = rand(0.02, 0.2);
    this.phase = rand(0,Math.PI*2);
  }
  update(dt){
    this.phase += this.speed * dt * 0.001;
    this.alpha = 0.08 + Math.sin(this.phase)*0.06;
  }
  draw(ctx){
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,200,230,1)';
    ctx.fill();
    ctx.restore();
  }
}

const sparks = Array.from({length: Math.max(12, Math.floor(window.innerWidth/80))}, ()=> new Spark());
let lastS = performance.now();
function animateSparks(now){
  const dt = now - lastS; lastS = now;
  sctx.clearRect(0,0,sparkleCanvas.width, sparkleCanvas.height);
  sparks.forEach(s => { s.update(dt); s.draw(sctx); });
  requestAnimationFrame(animateSparks);
}
requestAnimationFrame(animateSparks);

// ------------------ utility: re-create after resize (keeps counts responsive) ------------------
window.addEventListener('resize', ()=> {
  // adjust petal counts a bit if desired (optional)
});

// End of script
