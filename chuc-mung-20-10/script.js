const music = document.getElementById('bg-music');
const icon = document.getElementById('music-icon');

function toggleMusic() {
  if (music.paused) {
    music.play();
    icon.src = "https://cdn-icons-png.flaticon.com/512/727/727245.png"; // icon bật
  } else {
    music.pause();
    icon.src = "https://cdn-icons-png.flaticon.com/512/727/727240.png"; // icon tắt
  }
}

// Fix Chrome autoplay
window.addEventListener('click', () => {
  if (music.paused) music.play();
});
