const stage = document.querySelector('.mascot-stage');
const pauseButton = document.querySelector('.pause-dance');

if (stage && pauseButton) {
  pauseButton.addEventListener('click', () => {
    const paused = stage.classList.toggle('paused');
    pauseButton.textContent = paused ? 'PLAY DANCE' : 'PAUSE DANCE';
    pauseButton.setAttribute('aria-pressed', String(paused));
  });
}
