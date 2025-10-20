// 🎵 Xử lý phát nhạc
const music = document.getElementById("bgMusic");
const playBtn = document.getElementById("playButton");

async function tryPlayMusic() {
  try {
    await music.play();
    playBtn.style.display = "none";
  } catch {
    playBtn.style.display = "block"; // nếu bị chặn, hiện nút phát
  }
}

playBtn.addEventListener("click", () => {
  music.play();
  playBtn.style.display = "none";
});

// Tự động thử phát nhạc khi web load
window.addEventListener("load", tryPlayMusic);

// 🌸 Animation 3D kiểu hoa, tim bay bay
const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

const particles = [];
const colors = ["#ffb6c1", "#ffc0cb", "#ff69b4", "#ff1493", "#db7093"];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

class Heart {
  constructor() {
    this.x = random(0, canvas.width);
    this.y = random(canvas.height, canvas.height + 100);
    this.size = random(10, 25);
    this.speed = random(1, 3);
    this.color = colors[Math.floor(random(0, colors.length))];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.PI);
    ctx.scale(this.size / 20, this.size / 20);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -3, -5, -15, -15, -15);
    ctx.bezierCurveTo(-35, -15, -35, 10, -35, 10);
    ctx.bezierCurveTo(-35, 25, -15, 45, 0, 60);
    ctx.bezierCurveTo(15, 45, 35, 25, 35, 10);
    ctx.bezierCurveTo(35, 10, 35, -15, 15, -15);
    ctx.bezierCurveTo(5, -15, 0, -3, 0, 0);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.y -= this.speed;
    this.x += Math.sin(this.y / 20);
    if (this.y + this.size < 0) {
      this.y = canvas.height + 50;
      this.x = random(0, canvas.width);
    }
    this.draw();
  }
}

for (let i = 0; i < 60; i++) {
  particles.push(new Heart());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => p.update());
  requestAnimationFrame(animate);
}

animate();
