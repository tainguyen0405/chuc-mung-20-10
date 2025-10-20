const startHint = document.getElementById("start-hint");
const music = document.getElementById("bg-music");
const message = document.getElementById("message");
const flowerBtn = document.getElementById("flowerBtn");
const canvas = document.getElementById("fallingCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


/* 💖 Hiệu ứng tim rơi */
const hearts = [];
for (let i = 0; i < 40; i++) {
  hearts.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 8 + Math.random() * 12,
    speedY: 0.3 + Math.random() * 0.7,
    speedX: Math.random() * 0.3 - 0.15,
    opacity: 0.3 + Math.random() * 0.7,
    rotation: Math.random() * Math.PI * 2,
  });
}
function drawHeart(x, y, size, rotation, opacity) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(0, -3, -5, -5, -10, 0);
  ctx.bezierCurveTo(-15, 5, 0, 15, 0, 20);
  ctx.bezierCurveTo(0, 15, 15, 5, 10, 0);
  ctx.bezierCurveTo(5, -5, 0, -3, 0, 0);
  ctx.closePath();
  ctx.fillStyle = `rgba(255,150,255,${opacity})`;
  ctx.fill();
  ctx.restore();
}
function animateHearts() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let h of hearts) {
    h.y += h.speedY;
    h.x += h.speedX;
    h.rotation += 0.01;
    if (h.y > canvas.height + 20) {
      h.y = -20;
      h.x = Math.random() * canvas.width;
    }
    drawHeart(h.x, h.y, h.size, h.rotation, h.opacity);
  }
  requestAnimationFrame(animateHearts);
}

/* 🌸 Hoa bay */
const flowerCanvas = document.getElementById("flowerCanvas");
const fctx = flowerCanvas.getContext("2d");
flowerCanvas.width = window.innerWidth;
flowerCanvas.height = window.innerHeight;
let petals = [];

/* 🌷 Câu chúc ngắn ngẫu nhiên */
const randomWishes = [
  "Chúc bạn luôn xinh đẹp và rạng rỡ như hoa 🌸",
  "Mong bạn có một ngày 20/10 thật ngọt ngào 💖",
  "Chúc bạn luôn vui tươi, yêu đời và hạnh phúc 💐",
  "Bạn là đóa hoa đẹp nhất trong vườn xuân 💞",
  "Mọi điều tốt đẹp nhất đều dành cho bạn 🌷",
  "Hôm nay bạn chính là nữ chính của thế giới ✨",
  "Cười nhiều hơn nữa nhé, vì bạn rất xinh khi cười 😊",
  "Chúc bạn luôn mạnh mẽ, tự tin và hạnh phúc 💕",
  "Bạn xứng đáng được yêu thương mỗi ngày 💗",
  "Một đóa hoa – gửi tặng người tuyệt vời 🌹",
  "Ngày hôm nay thuộc về bạn – hãy thật rực rỡ nhé ☀️",
  "Chúc bạn luôn tràn đầy năng lượng và nụ cười 💫",
  "Một chút nắng, một chút gió – chúc bạn mãi hạnh phúc 🌼",
  "Mỗi ngày đều là ngày đặc biệt khi có bạn 🌻",
  "Hãy yêu bản thân như bạn đáng được yêu 💝",
  "Chúc bạn luôn được bao quanh bởi yêu thương 🌺",
  "Mỗi nụ cười của bạn là một món quà cho thế giới 😊",
  "Luôn tỏa sáng và theo đuổi ước mơ của mình ✨",
  "Gửi đến bạn muôn ngàn yêu thương dịu dàng 💞",
  "Chúc bạn có một ngày 20/10 tràn ngập niềm vui và hoa 🌸"
];

/* 💐 Khi click “Gửi hoa” */
flowerBtn.addEventListener("click", () => {
  // Hoa bay
  const count = 10 + Math.random() * 3;
  for (let i = 0; i < count; i++) {
    petals.push({
      x: window.innerWidth / 2,
      y: window.innerHeight - 100,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -2.5 - Math.random() * 2,
      size: 8 + Math.random() * 10,
      alpha: 1,
      hue: 300 + Math.random() * 60,
      rotate: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.1
    });
  }

  // Tạo câu chúc ngẫu nhiên
  const wishText = randomWishes[Math.floor(Math.random() * randomWishes.length)];
  showWishText(wishText);
});

function drawPetal(x, y, size, hue, alpha, rotation) {
  fctx.save();
  fctx.translate(x, y);
  fctx.rotate(rotation);
  fctx.scale(size / 10, size / 10);
  const gradient = fctx.createRadialGradient(0, 0, 0, 0, 0, 10);
  gradient.addColorStop(0, `hsla(${hue},100%,80%,${alpha})`);
  gradient.addColorStop(1, `hsla(${hue},100%,50%,0)`);
  fctx.fillStyle = gradient;
  fctx.beginPath();
  fctx.moveTo(0, 0);
  fctx.bezierCurveTo(0, -3, -4, -4, -8, 0);
  fctx.bezierCurveTo(-10, 4, 0, 10, 0, 12);
  fctx.bezierCurveTo(0, 10, 10, 4, 8, 0);
  fctx.bezierCurveTo(4, -4, 0, -3, 0, 0);
  fctx.fill();
  fctx.restore();
}
function animateFlowers() {
  fctx.clearRect(0, 0, flowerCanvas.width, flowerCanvas.height);
  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.01;
    p.rotate += p.spin;
    p.alpha -= 0.006;
    if (p.alpha <= 0) petals.splice(i, 1);
    else drawPetal(p.x, p.y, p.size, p.hue, p.alpha, p.rotate);
  }
  requestAnimationFrame(animateFlowers);
}

/* ✨ Hiển thị câu chúc ngắn + biến mất mượt */
function showWishText(text) {
  const el = document.createElement("div");
  el.className = "wish-text";
  el.innerText = text;
  document.body.appendChild(el);

  // Vị trí ngẫu nhiên
  el.style.left = Math.random() * (window.innerWidth - 300) + "px";
  el.style.top = Math.random() * (window.innerHeight - 200) + "px";

  // Sau 3s thì kích hoạt biến mất
  setTimeout(() => {
    el.classList.add("fade-out");
    setTimeout(() => el.remove(), 1500);
  }, 3000);
}

/* 🌈 CSS động cho hiệu ứng câu chúc */
const style = document.createElement("style");
style.textContent = `
.wish-text {
  position: fixed;
  color: #ff4fa2;
  font-size: 1.2rem;
  font-weight: 600;
  text-shadow: 0 0 10px #ff9ed1;
  pointer-events: none;
  z-index: 999;
  opacity: 0;
  transform: translateY(10px) scale(0.9);
  animation: wishPop 0.6s ease forwards;
}
@keyframes wishPop {
  from { opacity: 0; transform: translateY(10px) scale(0.8); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
/* 💫 Hiệu ứng biến mất (bay lên + xoay nhẹ + tan dần) */
.wish-text.fade-out {
  animation: wishVanish 1.5s ease forwards;
}
@keyframes wishVanish {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
    filter: blur(0);
  }
  40% {
    opacity: 0.8;
    transform: translateY(-15px) scale(1.05) rotate(3deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scale(0.9) rotate(-10deg);
    filter: blur(5px);
  }
}
`;
document.head.appendChild(style);

/* 💬 Hiệu ứng gõ chữ */
function typeEffect(text, elementId, speed = 80) {
  let i = 0;
  const el = document.getElementById(elementId);
  el.textContent = "";
  (function typing() {
    if (i < text.length) {
      el.textContent += text.charAt(i++);
      setTimeout(typing, speed);
    }
  })();
}

/* 🎥 Parallax 3D */
let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
document.addEventListener("mousemove", (e) => {
  targetX = (e.clientX / window.innerWidth - 0.5) * 10;
  targetY = (e.clientY / window.innerHeight - 0.5) * 10;
});
function smoothParallax() {
  currentX += (targetX - currentX) * 0.05;
  currentY += (targetY - currentY) * 0.05;
  document.body.style.transform = `rotateY(${currentX}deg) rotateX(${-currentY}deg)`;
  requestAnimationFrame(smoothParallax);
}
smoothParallax();

/* 🚀 Click → cinematic transition */
document.body.addEventListener("click", () => {
  const flash = document.getElementById("cinematic-flash");

  if (startHint) startHint.remove();
  flash.classList.add("active");

  setTimeout(() => {
    music.play().catch(() => {});
    message.classList.remove("hidden");
    message.classList.add("show");
    flowerBtn.classList.remove("hidden");
    flowerBtn.classList.add("show");

    typeEffect("Chúc bạn luôn xinh đẹp, hạnh phúc và tỏa sáng như ánh dương 💖", "messageText");
    animateHearts();
    animateFlowers();
  }, 200);

  setTimeout(() => {
    flash.remove();
  }, 1200);
}, { once: true });

/* 🌸 Logic màn kết */
const hintBtn = document.getElementById("hintBtn");
const finalScene = document.getElementById("finalScene");
let flowerClickCount = 0;

// Đếm số lần bấm "Tặng hoa"
flowerBtn.addEventListener("click", () => {
  flowerClickCount++;
  if (flowerClickCount === 3) {
    setTimeout(() => {
      hintBtn.style.display = "block";
      hintBtn.classList.add("show");
    }, 1000);
  }
});

// Khi bấm nút "Xem điều cuối cùng"
hintBtn.addEventListener("click", () => {
  message.classList.add("hidden");
  flowerBtn.classList.add("hidden");
  document.body.style.transform = "none";
  finalScene.style.display = "flex";
  setTimeout(() => finalScene.classList.add("show"), 50);
});

/* 🎬 Hiệu ứng cinematic intro + tagline */
document.body.addEventListener("click", () => {
  const flash = document.getElementById("cinematic-flash");
  const tagline = document.getElementById("tagline");
  if (startHint) startHint.remove();

  flash.classList.add("active");

  setTimeout(() => {
    music.play().catch(() => {});
    message.classList.remove("hidden");
    message.classList.add("show");
    flowerBtn.classList.remove("hidden");
    flowerBtn.classList.add("show");

    // ✨ Tagline hiện mượt
    if (tagline) {
      tagline.style.opacity = "0";
      tagline.style.transform = "translateY(20px)";
      setTimeout(() => {
        tagline.style.opacity = "1";
        tagline.style.transform = "translateY(0)";
      }, 1800);
    }
    
  }, 200); }, { once: true });
  /* 🌸 Hiệu ứng hoa anh đào rơi trong màn kết */
const sakuraCanvas = document.getElementById("sakuraCanvas");
const sakuraCtx = sakuraCanvas.getContext("2d");
sakuraCanvas.width = window.innerWidth;
sakuraCanvas.height = window.innerHeight;

let petalsFinal = [];

// 🌸 Tạo cánh hoa ngẫu nhiên
function createSakuraPetal() {
  return {
    x: Math.random() * sakuraCanvas.width,
    y: -20,
    size: 6 + Math.random() * 10,
    speedY: 0.8 + Math.random() * 1.5,
    speedX: Math.random() * 1 - 0.5,
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.02,
    opacity: 0.6 + Math.random() * 0.4,
    hue: 330 + Math.random() * 20 // Hồng nhạt
  };
}

// 🌸 Vẽ từng cánh hoa
function drawSakuraPetal(p) {
  sakuraCtx.save();
  sakuraCtx.translate(p.x, p.y);
  sakuraCtx.rotate(p.rotation);
  sakuraCtx.scale(p.size / 10, p.size / 10);
  const gradient = sakuraCtx.createRadialGradient(0, 0, 0, 0, 0, 10);
  gradient.addColorStop(0, `hsla(${p.hue},100%,90%,${p.opacity})`);
  gradient.addColorStop(1, `hsla(${p.hue},100%,70%,0)`);
  sakuraCtx.fillStyle = gradient;

  sakuraCtx.beginPath();
  sakuraCtx.moveTo(0, 0);
  sakuraCtx.bezierCurveTo(2, -4, 6, -6, 8, 0);
  sakuraCtx.bezierCurveTo(6, 6, -6, 6, -8, 0);
  sakuraCtx.closePath();
  sakuraCtx.fill();
  sakuraCtx.restore();
}

// 🌸 Animation rơi
function animateSakura() {
  sakuraCtx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

  if (Math.random() < 0.15) {
    petalsFinal.push(createSakuraPetal());
  }

  for (let i = petalsFinal.length - 1; i >= 0; i--) {
    const p = petalsFinal[i];
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.spin;
    if (p.y > sakuraCanvas.height + 20) petalsFinal.splice(i, 1);
    else drawSakuraPetal(p);
  }

  requestAnimationFrame(animateSakura);
}

// ✨ Chỉ chạy khi hiện phần kết
const observer = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    if (m.target.id === "finalScene" && m.target.classList.contains("show")) {
      animateSakura();
    }
  });
});
observer.observe(document.body, { subtree: true, attributes: true });

