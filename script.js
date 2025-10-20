/* script.js
  - per-letter title reveal + light sweep
  - parallax background/lensflare behavior
  - petals + sparkles + confetti
  - surprise modal shows greeting (per-letter reveal)
  - audio will play on gesture only (no autoplay hacks)
*/

/* ---------- Utilities ---------- */
function rand(min,max){ return Math.random()*(max-min)+min; }
function setupCanvas(canvas){ const dpr = window.devicePixelRatio || 1; canvas.width = Math.floor(window.innerWidth * dpr); canvas.height = Math.floor(window.innerHeight * dpr); canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px'; const ctx = canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); return ctx; }

/* ---------- Title: per-letter + sweep + initial entry ---------- */
const mainTitleEl = document.getElementById('mainTitle');
const titleText = mainTitleEl.textContent.trim();
mainTitleEl.textContent = ''; // clear

// split into chars and wrap
const chars = [];
for (let i=0;i<titleText.length;i++){
  const ch = titleText[i];
  const span = document.createElement('span');
  span.className = 'char';
  span.textContent = ch;
  mainTitleEl.appendChild(span);
  chars.push(span);
}

// stagger reveal
function revealTitleStagger(){
  chars.forEach((span, idx) => {
    const delay = idx * 40; // ms
    setTimeout(()=> span.classList.add('show'), delay);
  });
  // light sweep after reveal
  setTimeout(()=> mainTitleEl.classList.add('sweep'), chars.length*40 + 200);
}
window.addEventListener('load', ()=> {
  // small entry delay for cinematic effect
  setTimeout(revealTitleStagger, 220);
});

/* ---------- Parallax: move lensflare & 3D title follow ---------- */
const lens = document.getElementById('lensflare');
const titleWrap = document.getElementById('titleWrap');
window.addEventListener('mousemove', (e)=>{
  const cx = window.innerWidth/2, cy = window.innerHeight/2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  // move lens slightly opposite for parallax
  lens.style.transform = `translate3d(${dx * -6}vw, ${dy * -2}vh, 0)`;
  // title 3D tilt
  const rx = dy * 6;
  const ry = dx * -8;
  titleWrap.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
});
window.addEventListener('touchmove', (e) => {
  if (!e.touches||!e.touches[0]) return;
  const t = e.touches[0];
  const cx = window.innerWidth/2, cy = window.innerHeight/2;
  const dx = (t.clientX - cx) / cx;
  const dy = (t.clientY - cy) / cy;
  lens.style.transform = `translate3d(${dx * -6}vw, ${dy * -2}vh, 0)`;
  const rx = dy * 6;
  const ry = dx * -8;
  titleWrap.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
}, { passive:true });

window.addEventListener('mouseout', ()=> { titleWrap.style.transform=''; lens.style.transform=''; });
window.addEventListener('touchend', ()=> { titleWrap.style.transform=''; lens.style.transform=''; });

/* ---------- Petals layer (canvas) ---------- */
const petalCanvas = document.getElementById('petalCanvas');
const pctx = setupCanvas(petalCanvas);
window.addEventListener('resize', ()=> setupCanvas(petalCanvas));

function createPetalImg(){
  const c = document.createElement('canvas');
  c.width = 100; c.height = 100;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0,0,100,100);
  grad.addColorStop(0,'#fff2f6'); grad.addColorStop(0.6,'#ffb6d0'); grad.addColorStop(1,'#ffc7d7');
  g.translate(50,50); g.rotate(Math.PI/12);
  g.beginPath();
  g.moveTo(0,-22); g.bezierCurveTo(16,-44,40,-44,46,-22);
  g.bezierCurveTo(40,6,16,28,0,58); g.bezierCurveTo(-16,28,-40,6,-46,-22); g.closePath();
  g.fillStyle = grad; g.fill();
  return c;
}
const petalImg = createPetalImg();

class Petal {
  constructor(depth){ this.depth = depth; this.reset(true); }
  reset(init=false){
    this.x = rand(-200, window.innerWidth+200);
    this.y = init? rand(-200, window.innerHeight) : rand(-400,-20);
    this.size = rand(0.5,1.6)*(1 + (1-this.depth)*0.6);
    this.speedY = rand(0.35,1.6)*(1 + (1-this.depth));
    this.speedX = rand(-0.7,0.7)*(0.6 + (1-this.depth)*0.6);
    this.rotation = rand(0,Math.PI*2);
    this.rotSpeed = rand(-0.02,0.02)*(1 + (1-this.depth));
    this.opacity = rand(0.55,1)*(0.6 + this.depth*0.4);
    this.phase = rand(0,Math.PI*2);
    this.swing = rand(12,80);
  }
  update(dt){
    this.phase += dt * 0.002 * (0.7 + (1 - this.depth)*0.6);
    this.x += Math.sin(this.phase) * (this.swing/40) * 0.35 * (1 + (1 - this.depth)*0.4) + this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotSpeed;
    if (this.y > window.innerHeight + 120 || this.x < -400 || this.x > window.innerWidth + 400) this.reset();
  }
  draw(ctx){ ctx.save(); ctx.globalAlpha = this.opacity; ctx.translate(this.x,this.y); ctx.rotate(this.rotation); ctx.scale(this.size,this.size); ctx.drawImage(petalImg, -petalImg.width/2, -petalImg.height/2); ctx.restore(); }
}

const layers = [{depth:0.28, count: Math.max(12, Math.round(window.innerWidth/60))},{depth:0.6, count: Math.max(18, Math.round(window.innerWidth/40))},{depth:0.95, count: Math.max(28, Math.round(window.innerWidth/28))}];
let petals = [];
function createPetals(){ petals = []; layers.forEach(layer => { for(let i=0;i<layer.count;i++) petals.push(new Petal(layer.depth)); }); }
createPetals();
window.addEventListener('resize', ()=> { createPetals(); setupCanvas(petalCanvas); });

let last = performance.now();
function animatePetals(now){
  const dt = now - last; last = now;
  pctx.clearRect(0,0,petalCanvas.width, petalCanvas.height);
  petals.forEach(p => { p.update(dt); p.draw(pctx); });
  requestAnimationFrame(animatePetals);
}
requestAnimationFrame(animatePetals);

/* ---------- Sparkles ---------- */
const sparkleCanvas = document.getElementById('sparkleCanvas');
const sctx = setupCanvas(sparkleCanvas);
window.addEventListener('resize', ()=> setupCanvas(sparkleCanvas));

class Spark { constructor(){ this.reset(); } reset(){ this.x = rand(0,window.innerWidth); this.y = rand(0,window.innerHeight); this.r = rand(1,5); this.alpha = rand(0.04,0.25); this.speed = rand(0.02,0.22); this.phase = rand(0,Math.PI*2); } update(dt){ this.phase += this.speed*dt*0.001; this.alpha = 0.08 + Math.sin(this.phase)*0.05; } draw(ctx){ ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle='rgba(255,200,230,1)'; ctx.fill(); ctx.restore(); } }
let sparks = Array.from({length: Math.max(10, Math.floor(window.innerWidth/90))}, ()=> new Spark());
let lastS = performance.now();
function animateSparks(now){
  const dt = now - lastS; lastS = now;
  sctx.clearRect(0,0,sparkleCanvas.width, sparkleCanvas.height);
  sparks.forEach(sp => { sp.update(dt); sp.draw(sctx); });
  requestAnimationFrame(animateSparks);
}
requestAnimationFrame(animateSparks);

function intensifySparks(duration=2500){
  const extra = Array.from({length: 30}, ()=> new Spark());
  sparks.push(...extra);
  setTimeout(()=> { sparks = sparks.slice(0, Math.max(10, Math.floor(window.innerWidth/90))); }, duration);
}

/* ---------- Confetti/heart ---------- */
const confettiCanvas = document.getElementById('confettiCanvas');
const cctx = setupCanvas(confettiCanvas);
window.addEventListener('resize', ()=> setupCanvas(confettiCanvas));

class Confetti {
  constructor(x,y){ this.x=x; this.y=y; this.vx=rand(-6,6); this.vy=rand(-12,-3); this.size=rand(6,14); this.r=Math.random()*Math.PI*2; this.color=this.randColor(); this.life=0; this.ttl=rand(1200,2400); this.shape=Math.random()>0.6?'heart':'rect'; }
  randColor(){ const p=['#ff6fa1','#ffb3c7','#ffd6e3','#ff8fb0','#ffd1e6','#ff9fb2']; return p[Math.floor(Math.random()*p.length)]; }
  update(dt){ this.vy += 0.35; this.x += this.vx; this.y += this.vy; this.r += 0.07; this.life += dt; }
  draw(ctx){ ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.r); ctx.globalAlpha = Math.max(0,1 - this.life/this.ttl); ctx.fillStyle = this.color; if (this.shape==='rect') ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size); else { ctx.beginPath(); const s=this.size/10; ctx.moveTo(0,-s*8); ctx.bezierCurveTo(-s*12,-s*14,-s*28,-s*2,0,s*14); ctx.bezierCurveTo(s*28,-s*2,s*12,-s*14,0,-s*8); ctx.fill(); } ctx.restore(); }
}
let confettis=[];
function confettiBurst(pos=null){
  const cx = pos? pos.x : window.innerWidth/2;
  const cy = pos? pos.y : window.innerHeight/2;
  const count = 45 + Math.floor(Math.random()*35);
  for (let i=0;i<count;i++) confettis.push(new Confetti(cx + rand(-40,40), cy + rand(-20,20)));
  let lastC = performance.now();
  function loop(now){
    const dt = now - lastC; lastC = now;
    cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    confettis.forEach(cf => { cf.update(dt); cf.draw(cctx); });
    confettis = confettis.filter(cf=> cf.life < cf.ttl);
    if (confettis.length > 0) requestAnimationFrame(loop); else cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  }
  requestAnimationFrame(loop);
}

/* ---------- Surprise: modal + message reveal on click ---------- */
const tapHint = document.getElementById('tapHint');
const surpriseOverlay = document.getElementById('surpriseOverlay');
const surpriseCard = document.getElementById('surpriseCard');
const surpriseMsgEl = document.getElementById('surpriseMessage');
const closeSurprise = document.getElementById('closeSurprise');
const closeBtn = document.getElementById('closeBtn');
const shareBtn = document.getElementById('shareBtn');
const bgAudio = document.getElementById('bgAudio');

const greeting = `Chúc bạn một ngày 20/10 thật xinh tươi, luôn rạng rỡ và tràn đầy yêu thương. Cảm ơn vì đã làm thế giới đẹp hơn mỗi ngày! 💐`;

// reveal greeting per-letter
function revealGreeting(text, targetEl){
  targetEl.textContent = '';
  const letters = Array.from(text);
  letters.forEach((ch, idx) => {
    const span = document.createElement('span');
    span.style.opacity = '0';
    span.style.display = 'inline-block';
    span.style.transform = 'translateY(8px)';
    span.textContent = ch;
    targetEl.appendChild(span);
    setTimeout(()=> {
      span.style.transition = 'transform 420ms cubic-bezier(.2,.9,.3,1), opacity 420ms ease';
      span.style.opacity = '1';
      span.style.transform = 'translateY(0)';
    }, idx * 30);
  });
}

// trigger function for surprise
async function doSurprise(pos=null){
  // show modal
  surpriseOverlay.classList.add('show');
  surpriseOverlay.setAttribute('aria-hidden','false');

  // play music (only on gesture)
  try { await bgAudio.play(); } catch(e) { /* ignored; user gesture required in some browsers */ }

  // title cinematic shimmer and light sweep
  mainTitleEl.classList.remove('sweep');
  void mainTitleEl.offsetWidth;
  mainTitleEl.classList.add('sweep');

  mainTitleEl.classList.remove('shimmer');
  void mainTitleEl.offsetWidth;
  mainTitleEl.classList.add('shimmer');

  // confetti burst
  confettiBurst(pos);

  // intensify sparks
  intensifySparks(3500);

  // reveal greeting text in card
  setTimeout(()=> revealGreeting(greeting, surpriseMsgEl), 240);

  // small zoom effect on page
  document.getElementById('mainCard').style.transition = 'transform 520ms cubic-bezier(.2,.9,.3,1)';
  document.getElementById('mainCard').style.transform = 'scale(1.03)';
  setTimeout(()=> { document.getElementById('mainCard').style.transform = ''; }, 520);
}

// click/tap handling: button or anywhere (first interaction)
function onFirstGesture(e){
  // determine pointer coordinates for confetti
  const pos = e && e.clientX !== undefined ? {x: e.clientX, y: e.clientY} : null;
  // hide hint
  tapHint.classList.remove('pulse');
  tapHint.style.opacity = '0.9';
  // call surprise
  doSurprise(pos);
}

// bind events
tapHint.addEventListener('click', onFirstGesture, { once:true });
window.addEventListener('pointerdown', function oncePointer(e){ onFirstGesture(e); window.removeEventListener('pointerdown', oncePointer); }, { once:true });
window.addEventListener('keydown', function onceKey(){ onFirstGesture(); window.removeEventListener('keydown', onceKey); }, { once:true });

// close handlers
closeSurprise.addEventListener('click', ()=> { surpriseOverlay.classList.remove('show'); surpriseOverlay.setAttribute('aria-hidden','true'); surpriseMsgEl.textContent=''; });
closeBtn.addEventListener('click', ()=> { surpriseOverlay.classList.remove('show'); surpriseOverlay.setAttribute('aria-hidden','true'); surpriseMsgEl.textContent=''; });

// share: copy text to clipboard
shareBtn.addEventListener('click', async ()=> {
  try {
    await navigator.clipboard.writeText(greeting);
    shareBtn.textContent = 'Đã sao chép!';
    setTimeout(()=> shareBtn.textContent = 'Sao chép lời chúc', 2000);
  } catch(e) {
    shareBtn.textContent = 'Không sao chép được';
    setTimeout(()=> shareBtn.textContent = 'Sao chép lời chúc', 2000);
  }
});

/* keep canvases DPR-responsive if DPR changes */
let lastDPR = window.devicePixelRatio;
setInterval(()=> { if (window.devicePixelRatio !== lastDPR){ lastDPR = window.devicePixelRatio; setupCanvas(petalCanvas); setupCanvas(sparkleCanvas); setupCanvas(confettiCanvas); } }, 1000);
