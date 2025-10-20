const openBtn = document.getElementById("open-surprise");
const messageBox = document.getElementById("message-box");
const closeBtn = document.querySelector(".close-btn");
const bgMusic = document.getElementById("bg-music");

// Hiển thị hộp thư khi bấm dòng chữ
openBtn.addEventListener("click", () => {
  messageBox.classList.remove("hidden");
});

// Tắt hộp thư
closeBtn.addEventListener("click", () => {
  messageBox.classList.add("hidden");
});

// Auto play nhạc khi mở trang (vượt giới hạn autoplay của một số trình duyệt)
window.addEventListener('load', () => {
  bgMusic.muted = true;
  bgMusic.play().then(() => {
    bgMusic.muted = false;
  }).catch(() => {
    document.body.addEventListener('click', () => {
      bgMusic.muted = false;
      bgMusic.play();
    }, { once: true });
  });
});

// Hoa rơi
const canvas = document.getElementById('flower-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let flowers = [];
const flowerEmoji = ["🌸","💖","🌼","✨"];
const flowerCount = 40;

class Flower {
  constructor(){
    this.reset();
  }
  reset(){
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.size = 20 + Math.random()*20;
    this.speed = 1 + Math.random()*2;
    this.char = flowerEmoji[Math.floor(Math.random()*flowerEmoji.length)];
    this.rotation = Math.random()*360;
  }
  update(){
    this.y += this.speed;
    this.rotation += 1;
    if(this.y > canvas.height+this.size) this.reset();
  }
  draw(){
    ctx.save();
    ctx.font = `${this.size}px "Be Vietnam Pro"`;
    ctx.translate(this.x,this.y);
    ctx.rotate(this.rotation*Math.PI/180);
    ctx.fillText(this.char,0,0);
    ctx.restore();
  }
}

for(let i=0;i<flowerCount;i++){
  flowers.push(new Flower());
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  flowers.forEach(f=>{
    f.update();
    f.draw();
  });
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize',()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
