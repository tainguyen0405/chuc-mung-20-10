/* script.js - cinematic + robust audio + interaction surprise
   - autoplay attempt & AudioContext resume
   - gesture button to guarantee unmute + cinematic burst
   - petal + sparkle + confetti layers
   - parallax mouse effect on title
*/

/* ---------- Audio handling (robust) ---------- */
const audio = document.getElementById('bgAudio');
const tapHintBtn = document.getElementById('tapHint');

let audioContext = null;
let mediaSource = null;
let fadeInterval = null;

function startMutedPlay() {
  try {
    audio.muted = true;
    audio.volume = 0;
    const p = audio.play();
    if (p && p.catch) p.catch(e => console.warn('Muted autoplay blocked:', e));
  } catch(e){ console.warn('startMutedPlay error', e); }
}

async function tryUnmuteAndFade() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      try { mediaSource = audioContext.createMediaElementSource(audio); mediaSource.connect(audioContext.destination); } catch(e){ /* ignore crossOrigin issues */ }
    }
    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume().catch(()=>{});
    }
    audio.muted = false;
    const p = audio.play();
    if (!p) { fadeIn(); return true; }
    await p;
    fadeIn();
    return true;
  } catch (err) {
    audio.muted = true;
    console.warn('tryUnmuteAndFade failed', err);
    return false;
  }
}

function fadeIn(step=0.02, interval=80, target=0.9) {
  if (fadeInterval) clearInterval(fadeInterval);
  fadeInterval = setInterval(()=> {
    audio.volume = Math.min(target, audio.volume + step);
    if (audio.volume >= target) clearInterval(fadeInterval);
  }, interval);
}

window.addEventListener('load', () => {
  startMutedPlay();
  setTimeout(async () => {
    const ok = await tryUnmuteAndFade();
    if (!ok) {
      tapHintBtn.classList.add('pulse');
    } else {
      tapHintBtn.style.display = 'none';
    }
  }, 500);
});

async function handleUserGesture(ev){
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    try { mediaSource = audioContext.createMediaElementSource(audio); mediaSource.connect(audioContext.destination); } catch(e){}
  }
  if (audioContext.state === 'suspended') {
    try { await audioContext.resume(); } catch(e){ console.warn('AudioContext resume failed', e); }
  }

  audio.muted = false;
  try { await audio.play(); } catch(e) { console.warn('play after gesture failed', e); }

  fadeIn(0.04, 60, 0.95);

  triggerCinematic(ev && ev.clientX !== undefined ? {x:ev.clientX, y:ev.clientY} : null);

  tapHintBtn.classList.remove('pulse');
  tapHintBtn.style.opacity = '0.9';
}

tapHintBtn.addEventListener('click', handleUserGesture, { once:true });
window.addEventListener('pointerdown', function oncePointer(e){
  handleUserGesture(e);
  window.removeEventListener('pointerdown', oncePointer);
}, { once:true });
window.addEventListener('keydown', function onceKey(e){
  handleUserGesture();
  window.removeEventListener('keydown', onceKey);
}, { once:true });

/* ---------- Canvas utilities ---------- */
function setupCanvas(canvas){
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return ctx;
}

/* ---------- Petal layer ---------- */
const petalCanvas = document.getElementById('petalCanvas');
const pctx = setupCanvas(petalCanvas);
window.addEventListener('resize', ()=> setupCanvas(petalCanvas));

function rand(min,max){ return Math.random()*(max-min)+min; }

function createPetalCache(){
  const c = document.createElement('canvas'); c.width = 120; c.height = 120;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0,0,120,120);
  grad.addColorStop(0,'#fff2f6'); grad.addColorStop(0.6,'#ffb6d0'); grad.addColorStop(1,'#ffc7d7');
  g.translate(60,60); g.rotate(Math.PI/12);
  g.beginPath();
  g.moveTo(0,-26); g.bezierCurveTo(18,-54,46,-54,54,-26);
  g.bezierCurveTo(46,8,18,36,0,74); g.bezierCurveTo(-18,36,-46,8,-54,-26); g.closePath();
  g.fillStyle = grad; g.fill();
  return c;
}
const petalImg = createPetalCache();

class Petal {
  constructor(depth){ this.depth = depth; this.reset(true); }
  reset(init=false){
    this.x = rand(-200, window.innerWidth+200);
    this.y = init ? rand(-200, window.innerHeight) : rand(-400, -50);
    this.size = rand(0.5, 1.6) * (1 + (1 - this.depth) * 0.6);
    this.speedY = rand(0.35, 1.6) * (1 + (1 - this.depth));
    this.speedX = rand(-0.7, 0.7) * (0.6 + (1 - this.depth) * 0.6);
    this.rotation = rand(0, Math.PI*2);
    this.rotSpeed = rand(-0.02, 0.02) * (1 + (1 - this.depth));
    this.opacity = rand(0.55, 1) * (0.6 + this.depth * 0.4);
    this.phase = rand(0, Math.PI*2);
    this.swing = rand(12, 80);
  }
  update(dt){
    this.phase += dt * 0.002 * (0.7 + (1 - this.depth) * 0.6);
    this.x += Math.sin(this.phase) * (this.swing/40) * 0.35 * (1 + (1 - this.depth) * 0.4) + this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotSpeed;
    if (this.y > window.innerHeight + 120 || this.x < -400 || this.x > window.innerWidth + 400) this.reset();
  }
  draw(ctx){ ctx.save(); ctx.globalAlpha = this.opacity; ctx.translate(this.x,this.y); ctx.rotate(this.rotation); ctx.scale(this.size,this.size); ctx.drawImage(petalImg, -petalImg.width/2, -petalImg.height/2); ctx.restore(); }
}
const layers = [
  {depth:0.28, count: Math.max(12, Math.round(window.innerWidth/60))},
  {depth:0.6,  count: Math.max(18, Math.round(window.innerWidth/40))},
  {depth:0.95, count: Math.max(28, Math.round(window.innerWidth/28))}
];
let petals = [];
function createPetals(){
  petals = [];
  layers.forEach(layer => { for(let i=0;i<layer.count;i++) petals.push(new Petal(layer.depth)); });
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

/* ---------- Sparkles ---------- */
const sparkleCanvas = document.getElementById('sparkleCanvas');
const sctx = setupCanvas(sparkleCanvas);
window.addEventListener('resize', ()=> setupCanvas(sparkleCanvas));

class Spark { constructor(){ this.reset(); } reset(){ this.x = rand(0,window.innerWidth); this.y = rand(0,window.innerHeight); this.r = rand(1,5); this.alpha = rand(0.04,0.25); this.speed = rand(0.02,0.22); this.phase = rand(0,Math.PI*2); } update(dt){ this.phase += this.speed * dt * 0.001; this.alpha = 0.08 + Math.sin(this.phase) * 0.05; } draw(ctx){ ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle = 'rgba(255,200,230,1)'; ctx.fill(); ctx.restore(); } }
let sparks = Array.from({length: Math.max(10, Math.floor(window.innerWidth/90))}, ()=> new Spark());
let lastS = performance.now();
function animateSparks(now){
  const dt = now - lastS; lastS = now;
  sctx.clearRect(0,0,sparkleCanvas.width, sparkleCanvas.height);
  for (let sp of sparks){ sp.update(dt); sp.draw(sctx); }
  requestAnimationFrame(animateSparks);
}
requestAnimationFrame(animateSparks);

function intensifySparks(duration=2500){
  const extra = Array.from({length: 30}, ()=> new Spark());
  sparks.push(...extra);
  setTimeout(()=> { sparks = sparks.slice(0, Math.max(10, Math.floor(window.innerWidth/90))); }, duration);
}

/* ---------- Confetti/Heart burst ---------- */
const confettiCanvas = document.getElementById('confettiCanvas');
const cctx = setupCanvas(confettiCanvas);
window.addEventListener('resize', ()=> setupCanvas(confettiCanvas));

class Confetti {
  constructor(x,y){ this.x = x; this.y = y; this.vx = rand(-6,6); this.vy = rand(-12,-3); this.size = rand(6,14); this.r = Math.random()*Math.PI*2; this.color = this.randColor(); this.life = 0; this.ttl = rand(1200,2400); this.shape = Math.random() > 0.6 ? 'heart' : 'rect'; }
  randColor(){ const p = ['#ff6fa1','#ffb3c7','#ffd6e3','#ff8fb0','#ffd1e6','#ff9fb2']; return p[Math.floor(Math.random()*p.length)]; }
  update(dt){ this.vy += 0.35; this.x += this.vx; this.y += this.vy; this.r += 0.07; this.life += dt; }
  draw(ctx){ ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.r); ctx.globalAlpha = Math.max(0,1 - this.life/this.ttl); ctx.fillStyle = this.color; if (this.shape === 'rect') ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size); else { ctx.beginPath(); const s = this.size/10; ctx.moveTo(0, -s*8); ctx.bezierCurveTo(-s*12, -s*14, -s*28, -s*2, 0, s*14); ctx.bezierCurveTo(s*28, -s*2, s*12, -s*14, 0, -s*8); ctx.fill(); } ctx.restore(); }
}
let confettis = [];
function confettiBurst(pos=null){ const cx = pos ? pos.x : window.innerWidth/2; const cy = pos ? pos.y : window.innerHeight/2; const count = 50 + Math.floor(Math.random()*40); for (let i=0;i<count;i++) confettis.push(new Confetti(cx + rand(-40,40), cy + rand(-20,20))); let lastC = performance.now(); function loop(now){ const dt = now - lastC; lastC = now; cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height); confettis.forEach(cf => { cf.update(dt); cf.draw(cctx); }); confettis = confettis.filter(cf => cf.life < cf.ttl); if (confettis.length > 0) requestAnimationFrame(loop); else cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height); } requestAnimationFrame(loop); }

/* ---------- Trigger cinematic ---------- */
function triggerCinematic(pos=null){
  const title = document.getElementById('mainTitle');
  title.classList.remove('shimmer');
  void title.offsetWidth; // reflow
  title.classList.add('shimmer');

  confettiBurst(pos);
  intensifySparks(3500);

  const mainCard = document.getElementById('mainCard');
  mainCard.style.transition = 'transform 520ms cubic-bezier(.2,.9,.3,1)';
  mainCard.style.transform = 'scale(1.03)';
  setTimeout(()=> { mainCard.style.transform = ''; }, 520);
}

/* ---------- Parallax title follow ---------- */
const titleWrap = document.getElementById('titleWrap');
window.addEventListener('mousemove', (e)=> {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  const rx = dy * 6;
  const ry = dx * -8;
  titleWrap.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
});
window.addEventListener('touchmove', (e)=> {
  if (!e.touches || !e.touches[0]) return;
  const t = e.touches[0];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (t.clientX - cx) / cx;
  const dy = (t.clientY - cy) / cy;
  const rx = dy * 6;
  const ry = dx * -8;
  titleWrap.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
}, { passive:true });
window.addEventListener('mouseout', ()=> { titleWrap.style.transform = ''; });
window.addEventListener('touchend', ()=> { titleWrap.style.transform = ''; });

/* keep canvases DPR-updated */
let lastDPR = window.devicePixelRatio;
setInterval(()=> { if (window.devicePixelRatio !== lastDPR) { lastDPR = window.devicePixelRatio; setupCanvas(petalCanvas); setupCanvas(sparkleCanvas); setupCanvas(confettiCanvas); } }, 1000);
