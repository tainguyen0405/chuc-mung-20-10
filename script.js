// --- TỰ ĐỘNG PHÁT NHẠC VỚI FADE-IN ---
const music = document.getElementById("bgMusic");
music.volume = 0; // Bắt đầu im lặng

window.addEventListener("load", () => {
  // Thử phát nhạc khi trang load
  music.play().then(() => {
    console.log("Nhạc đang phát tự động...");
    // Tăng âm lượng dần để tránh bị chặn
    let vol = 0;
    const fade = setInterval(() => {
      if (vol < 0.8) {
        vol += 0.05;
        music.volume = vol;
      } else clearInterval(fade);
    }, 200);
  }).catch(err => {
    console.warn("Trình duyệt chặn autoplay:", err);
  });
});

// --- Hiệu ứng 3D Floating Hearts ---
const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Heart {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 100;
    this.size = 10 + Math.random() * 25;
    this.speedY = 0.6 + Math.random() * 1.2;
    this.speedX = (Math.random() - 0.5) * 0.8;
    this.alpha = 0.7 + Math.random() * 0.3;
    this.color = `rgba(255, ${80 + Math.random()*100}, ${120 + Math.random()*100}, ${this.alpha})`;
  }
  update() {
    this.y -= this.speedY;
    this.x += this.speedX;
    if (this.y < -40) this.reset();
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    const s = this.size;
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-s/2, -s/2, -s, s/3, 0, s);
    ctx.bezierCurveTo(s, s/3, s/2, -s/2, 0, 0);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

const hearts = Array.from({ length: 40 }, () => new Heart());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hearts.forEach(h => { h.update(); h.draw(); });
  requestAnimationFrame(animate);
}
animate();
