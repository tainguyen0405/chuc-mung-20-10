const openBtn = document.getElementById("open-surprise");
const messageBox = document.getElementById("message-box");
const closeBtn = document.querySelector(".close-btn");
const bgMusic = document.getElementById("bg-music");

// Ban đầu hộp thư ẩn
messageBox.classList.add("hidden");

// Khi nhấn dòng chữ -> hiện hộp thư
openBtn.addEventListener("click", () => {
  messageBox.classList.remove("hidden");
  messageBox.classList.add("show");
});

// Khi nhấn dấu X -> ẩn hộp thư
closeBtn.addEventListener("click", () => {
  messageBox.classList.remove("show");
  setTimeout(() => messageBox.classList.add("hidden"), 400);
});

// Tự động phát nhạc khi mở trang (fix chuẩn cho Chrome, Safari, Edge)
window.addEventListener("load", () => {
  const tryPlay = () => {
    bgMusic.muted = false;
    bgMusic.play().catch(() => {});
  };

  // Thử bật nhạc im lặng trước để “unlock”
  bgMusic.muted = true;
  bgMusic.play().then(() => {
    setTimeout(() => {
      bgMusic.muted = false;
      bgMusic.play();
    }, 300);
  }).catch(() => {
    document.body.addEventListener("click", tryPlay, { once: true });
  });
});

// Hiệu ứng hoa rơi
const canvas = document.getElementById('flower-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const flowerEmoji = ["🌸", "💖", "🌼", "✨", "🌷", "🌹"];
const flowers = [];

class Flower {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.size = 20 + Math.random() * 25;
    this.speed = 1 + Math.random() * 2;
    this.char = flowerEmoji[Math.floor(Math.random() * flowerEmoji.length)];
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

for (let i = 0; i < 40; i++) flowers.push(new Flower());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  flowers.forEach(f => { f.update(); f.draw(); });
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
