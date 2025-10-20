// Bật nhạc khi người dùng tương tác
document.body.addEventListener("click", function() {
  const audio = document.getElementById("bg-music");
  audio.play().catch(()=>{});
  document.querySelector(".message").classList.remove("hidden");
});

// Hoa rơi 🌸
const canvas = document.getElementById('flower-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let flowers = [];
const flowerCount = 30;
const flowerEmoji = ["🌸", "🌼", "💖", "✨"];

class Flower {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.speed = 1 + Math.random() * 2;
    this.size = 20 + Math.random() * 20;
    this.char = flowerEmoji[Math.floor(Math.random()*flowerEmoji.length)];
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

for (let i = 0; i < flowerCount; i++) {
  flowers.push(new Flower());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  flowers.forEach(flower => {
    flower.update();
    flower.draw();
  });
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', ()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
