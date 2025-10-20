// script.js - petal canvas + autoplay/fade-in audio

const audio = document.getElementById('bgAudio');

// 1) AUDIO: start muted, play, then try to unmute + fade-in
function fadeInAudio(step=0.02, interval=80, target=0.85){
  let v = audio.volume;
  const id = setInterval(()=>{
    v = Math.min(target, v + step);
    audio.volume = v;
    if (v >= target) clearInterval(id);
  }, interval);
}

function awaitGestureToUnmute(){
  function onGesture(){
    audio.muted = false;
    audio.play().catch(()=>{});
    fadeInAudio(0.03, 60);
    window.removeEventListener('pointerdown', onGesture);
    window.removeEventListener('keydown', onGesture);
  }
  window.addEventListener('pointerdown', onGesture, { once:true });
  window.addEventListener('keydown', onGesture, { once:true });
}

function tryAutoPlayAndUnmute(){
  audio.muted = true;
  audio.volume = 0;
  const p = audio.play();
  if (p !== undefined){
    p.then(()=> {
      setTimeout(()=> {
        try {
          audio.muted = false;
          fadeInAudio(0.02, 80);
        } catch(err){
          console.warn('Unmute blocked; waiting for gesture', err);
          awaitGestureToUnmute();
        }
      }, 600);
    }).catch(err=>{
      console.warn('autoplay failed, will wait for gesture', err);
      awaitGestureToUnmute();
    });
  } else {
    awaitGestureToUnmute();
  }
}
window.addEventListener('load', tryAutoPlayAndUnmute);

// 2) PETAL CANVAS (improved motion: horizontal sway + rotation + density responsive)
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

// create cached petal image for performance
function createPetalImg(){
  const c = document.createElement('canvas');
  c.width = 90; c.height = 90;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0,0,90,90);
  grad.addColorStop(0,'#ffd6e3');
  grad.addColorStop(0.6,'#ff8fb0');
  grad.addColorStop(1,'#ffc7d7');

  g.translate(45,45);
  g.rotate(Math.PI/10);
  g.beginPath();
  g.moveTo(0,-18);
  g.bezierCurveTo(14,-38,36,-38,42,-18);
  g.bezierCurveTo(36,6,14,20,0,42);
  g.bezierCurveTo(-14,20,-36,6,-42,-18);
  g.bezierCurveTo(-36,-38,-14,-38,0,-18);
  g.closePath();
  g.fillStyle = grad;
  g.fill();
  return c;
}
const petalImg = createPetalImg();

class Petal {
  constructor(init){
    this.reset(init);
  }
  reset(init=false){
    this.x = rand(-150, window.innerWidth + 150);
    this.y = init ? rand(0, window.innerHeight) : rand(-250, -50);
    this.size = rand(0.5, 1.6);
    this.speedY = rand(0.3, 1.8);
    this.speedX = rand(-0.9, 0.9);
    this.rotation = rand(0, Math.PI*2);
    this.rotSpeed = rand(-0.02, 0.02);
    this.opacity = rand(0.6, 1);
    this.phase = rand(
