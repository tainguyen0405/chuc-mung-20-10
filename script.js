/* script.js - cinematic + surprise interaction
   Features:
   - aggressive (but polite) autoplay attempt & fade-in
   - petals + sparkles (existing)
   - confetti/heart burst on user tap (surprise)
   - title shimmer animation when surprise triggers
*/

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
  }
}

const layers = [
  {depth:0.28, count: Math.max(12, Math.round(window.innerWidth/60))},
  {depth:0.6,  count: Math.max(18, Math.round(window.innerWidth/40))},
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
window.addEventListener('resize', ()=> { createPetals(); setupCanvas(petalCanvas); });

let last = performance.now();
function animatePetals(now){
  const dt = now - last; last = now;
  pctx.clearRect(0,0,petalCanvas.width, petalCanvas.height);
  for (let p of petals){ p.update(dt); p.draw(pctx); }
  requestAnimationFrame(animatePetals);
}
requestAnimationFrame(animatePetals);

/* ---------- SPARKLES LAYER ---------- */
const sparkleCanvas = document.getElementById('sparkleCanvas');
const sctx = setupCanvas(sparkleCanvas);
window.addEventListener('resize', ()=> setupCanvas(sparkleCanvas));

class Spark {
  constructor(){ this.reset(); }
  reset(){ this.x = rand(0, window.innerWidth); this.y = rand(0, window.innerHeight); this.r = rand(1,5); this.alpha = rand(0.04,0.26); this.speed = rand(0.02,0.2); this.phase = rand(0,Math.PI*2); }
  update(dt){ this.phase += this.speed * dt * 0.001; this.alpha = 0.08 + Math.sin(this.phase)*0.05; }
  draw(ctx){ ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fillStyle='rgba(255,200,230,1)'; ctx.fill(); ctx.restore(); }
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

// temporarily intensify sparks for cinematic effect
function intensifySparks(duration=2500){
  // add temporary extra sparks
  const extra = Array.from({length: 30}, ()=> new Spark());
  sparks.push(...extra);
  setTimeout(()=> {
    // remove extra sparks (simple approach: recreate base set)
    sparks = sparks.slice(0, Math.max(10, Math.floor(window.innerWidth/90)));
  }, duration);
}

/* ---------- CONFETTI / HEART BURST (on surprise) ---------- */
const confettiCanvas = document.getElementById('confettiCanvas');
const cctx = setupCanvas(confettiCanvas);
window.addEventListener('resize', ()=> setupCanvas(confettiCanvas));

class Confetti {
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.vx = rand(-6,6);
    this.vy = rand(-12,-4);
    this.size = rand(6,14);
    this.r = Math.random() * Math.PI * 2;
    this.color = this.randColor();
    this.life = 0;
    this.ttl = rand(1200, 2400); // ms
    this.shape = Math.random() > 0.6 ? 'heart' : 'rect';
  }
  randColor(){
    const palette = ['#ff6fa1','#ffb3c7','#ffd6e3','#ff8fb0','#ffd1e6','#ff9fb2'];
    return palette[Math.floor(Math.random()*palette.length)];
  }
  update(dt){
    this.vy += 0.35; // gravity
    this.x += this.vx;
    this.y += this.vy;
    this.r += 0.07;
    this.life += dt;
  }
  draw(ctx){
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.r);
    ctx.globalAlpha = Math.max(0, 1 - this.life / this.ttl);
    ctx.fillStyle = this.color;
    if (this.shape === 'rect') {
      ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
    } else {
      // heart shape
      ctx.beginPath();
      const s = this.size/10;
      ctx.moveTo(0, -s*8);
      ctx.bezierCurveTo(-s*12, -s*14, -s*28, -s*2, 0, s*14);
      ctx.bezierCurveTo(s*28, -s*2, s*12, -s*14, 0, -s*8);
      ctx.fill();
    }
    ctx.restore();
  }
}

let confettis = [];
function confettiBurst(pos=null){
  const cx = pos ? pos.x : window.innerWidth/2;
  const cy = pos ? pos.y : window.innerHeight/2;
  const count = 40 + Math.floor(Math.random()*30);
  for (let i=0;i<count;i++) confettis.push(new Confetti(cx + rand(-40,40), cy + rand(-20,20)));
  // animate
  let lastC = performance.now();
  function loop(now){
    const dt = now - lastC; lastC = now;
    cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    confettis.forEach(cf => { cf.update(dt); cf.draw(cctx); });
    confettis = confettis.filter(cf => cf.life < cf.ttl);
    if (confettis.length > 0) requestAnimationFrame(loop);
    else cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  }
  requestAnimationFrame(loop);
}

/* ---------- finished ---------- */
/* small helper to ensure canvases sizing remains correct when devicePixelRatio changes */
let dpiLast = window.devicePixelRatio;
setInterval(()=> {
  if (window.devicePixelRatio !== dpiLast) {
    dpiLast = window.devicePixelRatio;
    setupCanvas(petalCanvas); setupCanvas(sparkleCanvas); setupCanvas(confettiCanvas);
  }
}, 1000);
