
/* ---------- AUDIO logic (muted autoplay -> try unmute -> on gesture unmute immediately) ---------- */
const audio = document.getElementById('bgAudio');
const tapHint = document.getElementById('tapHint');

audio.volume = 0;

async function startMutedPlay() {
  try {
    audio.muted = true;
    audio.volume = 0;
    const p = audio.play();
    if (p && p.catch) p.catch(()=>{});
  } catch(e){}
}

async function tryUnmuteAndFade(){
  try {
    audio.muted = false;
    const p = audio.play();
    if (!p) { fadeIn(); return true; }
    await p;
    fadeIn();
    return true;
  } catch(e){
    audio.muted = true;
    return false;
  }
}

function fadeIn(step=0.02, interval=80, target=0.9){
  clearInterval(window._fadeInterval);
  window._fadeInterval = setInterval(()=>{
    audio.volume = Math.min(target, audio.volume + step);
    if (audio.volume >= target) clearInterval(window._fadeInterval);
  }, interval);
}

// initial attempts
window.addEventListener('load', ()=>{
  startMutedPlay();
  setTimeout(async ()=>{
    const ok = await tryUnmuteAndFade();
    if (!ok) {
      // show hint pulse while waiting user gesture
      tapHint.classList.add('pulse');
    } else {
      tapHint.style.display = 'none';
    }
  }, 500);
});

// if user interacts anywhere, treat as the surprise gesture
async function handleSurpriseGesture(e){
  // first: unmute & play
  await tryUnmuteAndFade();

  // animate title
  const title = document.getElementById('mainTitle');
  title.classList.remove('shimmer');
  void title.offsetWidth; // force reflow
  title.classList.add('shimmer');

  // hide hint
  tapHint.classList.remove('pulse');
  setTimeout(()=> tapHint.style.opacity = '0.9', 200);

  // trigger confetti/heart burst
  confettiBurst(e ? {x: e.clientX, y: e.clientY} : null);

  // temporarily intensify sparkles
  intensifySparks(3000);
}

// listen for one gesture (pointerdown or key)
window.addEventListener('pointerdown', function oncePointer(e){
  handleSurpriseGesture(e);
  window.removeEventListener('pointerdown', oncePointer);
}, { once: true });

window.addEventListener('keydown', function onceKey(e){
  handleSurpriseGesture();
  window.removeEventListener('keydown', onceKey);
}, { once: true });

/* ---------- CANVAS SETUP (DPR-friendly) ---------- */
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/* ---------- PETAL LAYER (same as previous, slightly simplified) ---------- */
const petalCanvas = document.getElementById('petalCanvas');
const pctx = setupCanvas(petalCanvas);
window.addEventListener('resize', ()=> setupCanvas(petalCanvas));

function rand(min,max){ return Math.random()*(max-min)+min; }

function createPetalCache(){
  const c = document.createElement('canvas'), g = c.getContext('2d');
  c.width = 120; c.height = 120;
  const grad = g.createLinearGradient(0,0,120,120);
  grad.addColorStop(0,'#fff1f5'); grad.addColorStop(0.6,'#ffb3cf'); grad.addColorStop(1,'#ffc7d7');
  g.translate(60,60); g.rotate(Math.PI/10);
  g.beginPath();
  g.moveTo(0,-26); g.bezierCurveTo(18,-54,46,-54,54,-26);
  g.bezierCurveTo(46,8,18,36,0,74); g.bezierCurveTo(-18,36,-46,8,-54,-26);
  g.closePath(); g.fillStyle = grad; g.fill();
  return c;
}
const petalImg = createPetalCache();

class Petal {
  constructor(depth){ this.depth = depth; this.reset(true); }
  reset(init=false){
    this.x = rand(-200, window.innerWidth+200);
    this.y = init ? rand(-200, window.innerHeight) : rand(-300, -50);
    this.size = rand(0.5, 1.6) * (1 + (1-this.depth)*0.55);
    this.speedY = rand(0.35, 1.6) * (1 + (1-this.depth)*0.95);
    this.speedX = rand(-0.6, 0.6) * (0.6 + (1-this.depth)*0.6);
    this.rotation = rand(0, Math.PI*2);
    this.rotSpeed = rand(-0.02, 0.02) * (1 + (1-this.depth));
    this.opacity = rand(0.55, 1) * (0.6 + this.depth*0.4);
    this.phase = rand(0, Math.PI*2);
    this.swing = rand(12, 80);
  }
  update(dt){
    this.phase += dt * 0.002 * (0.7 + (1-this.depth)*0.6);
    this.x += Math.sin(this.phase) * (this.swing/40) * 0.35 * (1 + (1-this.depth)*0.4) + this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotSpeed;
    if (this.y > window.innerHeight + 120 || this.x < -300 || this.x > window.innerWidth + 300) this.reset();
  }
  draw(ctx){
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.size, this.size);
    ctx.drawImage(petalImg, -petalImg.width/2, -petalImg.height/2);
    ctx.restore();
