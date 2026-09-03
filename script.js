const intro = document.getElementById('intro');
const site = document.getElementById('site');
const skip = document.getElementById('skipIntro');

function revealSite() {
  intro.classList.add('out');
  setTimeout(() => {
    intro.remove();
    site.classList.remove('hidden');
    sessionStorage.setItem('toofIntroSeen', '1');
  }, 220);
}

if (sessionStorage.getItem('toofIntroSeen')) {
  intro.remove();
  site.classList.remove('hidden');
} else {
  setTimeout(() => intro.classList.add('bite'), 1300);
  setTimeout(revealSite, 3900);
}

skip?.addEventListener('click', revealSite);
