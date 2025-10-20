// ---------------------
// AUTO PLAY AUDIO
// ---------------------
const audio = document.getElementById('bgAudio');

// Một số trình duyệt chặn auto play => ta kích hoạt sau khi DOM load
window.addEventListener('load', () => {
  audio.play().catch(() => {
    // nếu bị chặn => click đầu tiên sẽ bật nhạc
    document.body.addEventListener('click', () => {
      audio.play();
    }, { once: true });
  });
});

// ---------------------
// HIỆU ỨNG HOA RƠI
// ---------------------
const canvas = document.getElementById('petalCanvas');
const ctx = canvas.getContext('2d');
let petals = [];
let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

window.addEventListener('resize', () => {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
});

class Petal {
  constructor() {
    this.x = Math.random() * W;
    this.y = Math.random() * -H;
    this.size = 15 + Math.random() * 15;
    this.speed = 1 + Math.random() * 3;
    this.angle = Math.random() * 360;
    this.spin = Math.random() * 2 - 1;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * Math.PI / 180);
    ctx.fillStyle = `rgba(255,182,193,${Math.random()*0.7+0.3})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 0.6, this.size, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.y += this.speed;
    this.angle += this.spin;
    if (this.y > H + 50) {
      this.y = -10;
      this.x = Math.random() * W;
    }
    this.draw();
  }
}

for (let i = 0; i < 80; i++) {
  petals.push(new Petal());
}

function animate() {
  ctx.clearRect(0, 0, W, H);
  petals.forEach(p => p.update());
  requestAnimationFrame(animate);
}

animate();
