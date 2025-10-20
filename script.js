const messageBox = document.getElementById("message-box");
const closeBtn = document.querySelector(".close-btn");
const bgMusic = document.getElementById("bg-music");

// Ẩn hộp thư lúc đầu
messageBox.classList.add("hidden");

// Khi bấm vào màn hình -> hiện hộp thư
document.body.addEventListener("click", () => {
  messageBox.classList.remove("hidden");
});

// Khi nhấn dấu X -> đóng hộp thư
closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  messageBox.classList.add("hidden");
});

// Tự động bật nhạc khi mở trang
window.addEventListener("load", () => {
  const tryPlay = () => {
    bgMusic.muted = false;
    bgMusic.play().catch(() => {});
  };

  // Thử autoplay
  bgMusic.muted = true;
  bgMusic.play().then(() => {
    setTimeout(() => {
      bgMusic.muted = false;
      bgMusic.play();
    }, 300);
  }).catch(() => {
    // Nếu bị chặn autoplay, bật sau khi user bấm
    document.body.addEventListener("click", tryPlay, { once: true });
  });
});

// Hiệu ứng hoa rơi
const canvas = document.getElementById('flower-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const emojis = ["🌸", "💖", "🌼", "✨", "🌷", "🌹"];
const petals = [];

class Flower {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.size = 20 + Math.random() * 25;
    this.speed = 1 + Math.random() * 2;
    this.char = emojis[Math.floor(Math.random() * emojis.length)];
    this.rotation = Math.random() * 360;
  }
  update() {
    this.y += this.speed;
    this.rotation += 1;
    if (this.y > canvas.height + this.size) this.reset();
  }
  draw() {
    ctx.save();
    ctx.font = `${this.size}px "Be Vietnam Pro"`;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.fillText(this.char, 0, 0);
    ctx.restore();
  }
}

for (let i = 0; i < 40; i++) petals.push(new Flower());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petals.forEach(f => {
    f.update();
    f.draw();
  });
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
