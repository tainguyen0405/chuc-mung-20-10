const messageBox = document.getElementById("message-box");
const closeBtn = document.querySelector(".close-btn");
const bgMusic = document.getElementById("bg-music");
const popupSound = document.getElementById("popup-sound");
const typedText = document.getElementById("typed-text");

const messageLines = [
  "Nhân ngày 20/10, chúc bạn luôn rạng rỡ như những bông hoa xinh đẹp nhất 💐.",
  "Cuộc sống của bạn luôn tràn đầy niềm vui, tiếng cười và hạnh phúc 💖.",
  "Mong bạn luôn tự tin, mạnh mẽ và tỏa sáng theo cách riêng của mình ✨.",
  "Mỗi ngày đều đáng yêu và đầy ắp yêu thương 💞.",
  "Hãy luôn là chính bạn – người tuyệt vời nhất! 🌸"
];

// typing effect
async function typeMessage() {
  typedText.textContent = "";
  for (let line of messageLines) {
    for (let char of line) {
      typedText.textContent += char;
      await new Promise(r => setTimeout(r, 40));
    }
    typedText.textContent += "\n";
    await new Promise(r => setTimeout(r, 300));
  }
  typedText.style.borderRight = "none";
}

// Khi bấm vào màn hình → mở hộp thư
document.body.addEventListener("click", () => {
  if (messageBox.classList.contains("hidden")) {
    popupSound.play();
    messageBox.classList.remove("hidden");
    typeMessage();
  }
});

// Đóng hộp thư
closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  messageBox.classList.add("hidden");
});

// Phát nhạc tự động
window.addEventListener("load", () => {
  const playMusic = () => {
    bgMusic.volume = 0.7;
    bgMusic.play().catch(() => {});
  };

  // Cố gắng autoplay
  bgMusic.play().catch(() => {
    document.body.addEventListener("click", playMusic, { once: true });
  });
});

// Hoa rơi 🌸
const canvas = document.getElementById('flower-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const emojis = ["🌸", "💖", "🌼", "✨", "🌷", "🌹"];
const petals = [];

class Flower {
  constructor() { this.reset(); }
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

for (let i = 0; i < 45; i++) petals.push(new Flower());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petals.forEach(f => { f.update(); f.draw(); });
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
