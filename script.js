

/* ---------- AUDIO: aggressive but polite autoplay attempt ---------- */
const audio = document.getElementById('bgAudio');
const hint = document.getElementById('hintTap');

audio.volume = 0; // start at 0 to be safe

function startMutedPlay() {
  try {
    audio.muted = true;
    audio.volume = 0;
    const p = audio.play();
    if (p && p.catch) p.catch(e => console.warn('muted autoplay blocked', e));
  } catch (e) { console.warn(e); }
}

async function tryUnmuteAndFade() {
  try {
    audio.muted = false;
    const p = audio.play();
    if (!p) { fadeIn(); hideHint(); return true; }
    await p;
    fadeIn();
    hideHint();
    return true;
  } catch (err) {
    audio.muted = true;
    return false;
  }
}

function fadeIn(step=0.02, interval=80, target=0.85) {
  clearInterval(window._fadeInterval);
  window._fadeInterval = setInterval(() => {
    audio.volume = Math.min(target, audio.volume + step);
    if (audio.volume >= target) clearInterval(window._fadeInterval);
  }, interval);
}

function showHint(){ hint.style.display='block'; }
function hideHint(){ hint.style.display='none'; }

let retryInterval = null;
function startRetryLoop(timeout=18000, interval=700) {
  if (retryInterval) return;
  const start = Date.now();
  retryInterval = setInterval(async () => {
    if (Date.now() - start > timeout) { clearInterval(retryInterval); retryInterval = null; showHint(); return; }
    const ok = await tryUnmuteAndFade();
    if (ok) { clearInterval(retryInterval); retryInterval = null; }
  }, interval);
}

window.addEventListener('load', () => {
  startMutedPlay();
  setTimeout(async () => {
    const ok = await tryUnmuteAndFade();
    if (!ok) startRetryLoop();
  }, 500);
});

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { tryUnmuteAndFade().then(ok=>{ if(!ok) startRetryLoop(); }); }
});
window.addEventListener('focus', () => { tryUnmuteAndFade().then(ok=>{ if(!ok) startRetryLoop(); }); });

hint.addEventListener('pointerdown', async () => { await tryUnmuteAndFade(); hideHint(); }, { once:true });
window.addEventListener('pointerdown', async function gesture(){ await tryUnmuteAndFade(); window.removeEventListener('pointerdown', gesture); }, { once:true });

/* ---------- UTILS: DPR-friendly canvas setup ---------- */
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

/* ---------- PETAL LAYER (3 depth layers) ---------- */
const petalCanvas = document.getElementById('petalCanvas');
const pctx = setupCanvas(petalCanvas);

window.addEventListener('resize', ()=> setupCanvas(petalCanvas));

function rand(min,max){ return Math.random()*(max-min)+min; }

function createPetalCache(){
  const c = document.createElement('canvas'); c.width = 120; c.height = 120;
  const g = c.getContext('2d');
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
  constructor(depth){
    this.depth = depth;
    this.reset(true);
  }
  reset(init=false){
    this.x = rand(-200, window.innerWidth + 200);
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
  }
}

const layers = [
  {depth:0.28, count: Math.max(12, Math.round(window.innerWidth/60))},
  {depth:0.6, count: Math.max(18, Math.round(window.innerWidth/40))},
  {depth:0.95, count: Math.max(28, Math.round(window.innerWidth/28))}
];

let petals = [];
function createPetals(){
  petals = [];
  layers.forEach(layer => {
    for(let i=0;i<layer.count;i++) petals.push(new Petal(layer.depth));
  });
}
createPetals();

window.addEventListener('resize', ()=> {
  createPetals();
  setupCanvas(petalCanvas);
  setupCanvas(document.getElementById('sparkleCanvas'));
});

/* animation loop */
let last = performance.now();
function animatePetals(now){
  const dt = now - last; last = now;
  pctx.clearRect(0,0,petalCanvas.width, petalCanvas.height);
  for (let p of petals){ p.update(dt); p.draw(pctx); }
  requestAnimationFrame(animatePetals);
}
requestAnimationFrame(animatePetals);

/* ---------- SPARKLE LAYER ---------- */
const sparkleCanvas = document.getElementById('sparkleCanvas');
const sctx = setupCanvas(sparkleCanvas);
window.addEventListener('resize', ()=> setupCanvas(sparkleCanvas));

class Spark {
  constructor(){ this.reset(); }
  reset(){
    this.x = rand(0, window.innerWidth);
    this.y = rand(0, window.innerHeight);
    this.r = rand(1,5);
    this.alpha = rand(0.04,0.26);
    this.speed = rand(0.02,0.2);
    this.phase = rand(0,Math.PI*2);
  }
  update(dt){ this.phase += this.speed*dt*0.001; this.alpha = 0.08 + Math.sin(this.phase)*0.05; }
  draw(ctx){ ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle='rgba(255,200,230,1)'; ctx.fill(); ctx.restore(); }
}
let sparks = Array.from({length: Math.max(10, Math.floor(window.innerWidth/90))}, ()=> new Spark());
let lastS = performance.now();
function animateSparks(now){
  const dt = now - lastS; lastS = now;
  sctx.clearRect(0,0,sparkleCanvas.width, sparkleCanvas.height);
  sparks.forEach(s => { s.update(dt); s.draw(sctx); });
  requestAnimationFrame(animateSparks);
}
requestAnimationFrame(animateSparks);

