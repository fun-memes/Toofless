const intro = document.getElementById('intro');
const introVideo = document.getElementById('introVideo');
const skip = document.getElementById('skipIntro');
const toothCursor = document.getElementById('toothCursor');
const mascot = document.getElementById('toofMascot');
const mascotArea = document.getElementById('mascotArea');

let introFinished = false;

function finishIntro() {
  if (introFinished) return;
  introFinished = true;
  intro?.classList.add('transitioning');
  document.body.classList.add('cursor-active');
  setTimeout(() => intro?.remove(), 900);
}

if (intro && introVideo) {
  introVideo.addEventListener('ended', finishIntro, { once: true });
  introVideo.addEventListener('error', finishIntro, { once: true });
  const playPromise = introVideo.play();
  if (playPromise?.catch) playPromise.catch(() => {});
}

skip?.addEventListener('click', finishIntro);
if (matchMedia('(prefers-reduced-motion: reduce)').matches) finishIntro();

let pointerX = innerWidth * .5;
let pointerY = innerHeight * .45;
let lastSnap = 0;
let activeAnimation = 'Idle';

function playMascotAnimation(name, {loop = true, returnToIdle = false} = {}) {
  if (!mascot || !('animationName' in mascot)) return;
  const available = mascot.availableAnimations || [];
  if (!available.includes(name)) return;
  activeAnimation = name;
  mascot.animationName = name;
  mascot.loop = loop;
  mascot.play?.();
  if (returnToIdle) {
    const onFinished = () => {
      mascot.removeEventListener('finished', onFinished);
      playMascotAnimation('Idle', {loop:true});
    };
    mascot.addEventListener('finished', onFinished, {once:true});
  }
}

if (mascot) {
  mascot.addEventListener('load', () => {
    mascotArea?.classList.add('model-ready');
    const animations = mascot.availableAnimations || [];
    const idle = animations.includes('Idle') ? 'Idle' : animations[0];
    if (idle) playMascotAnimation(idle, {loop:true});
  });
  mascot.addEventListener('error', () => mascotArea?.classList.remove('model-ready'));
  mascot.addEventListener('click', () => {
    const animations = mascot.availableAnimations || [];
    const jump = animations.includes('Jump') ? 'Jump' : animations.find(a => /jump/i.test(a));
    if (jump && activeAnimation !== jump) playMascotAnimation(jump, {loop:false, returnToIdle:true});
  });
}

function setCursor(x, y) {
  pointerX = x;
  pointerY = y;
  if (toothCursor) {
    toothCursor.style.left = `${x}px`;
    toothCursor.style.top = `${y}px`;
  }
  reactToTooth();
}

function reactToTooth() {
  if (!mascot || !mascotArea) return;
  const r = mascot.getBoundingClientRect();
  const cx = r.left + r.width * .56;
  const cy = r.top + r.height * .48;
  const dx = pointerX - cx;
  const dy = pointerY - cy;
  const dist = Math.hypot(dx, dy);
  mascotArea.classList.toggle('reaching', dist < 240);
  if (dist < 115 && performance.now() - lastSnap > 900) {
    mascotArea.classList.add('snapping');
    lastSnap = performance.now();
    setTimeout(() => mascotArea.classList.remove('snapping'), 520);
  }
}

window.addEventListener('mousemove', e => setCursor(e.clientX, e.clientY), { passive: true });

let touchTooth = null;
window.addEventListener('touchstart', e => {
  if (!e.touches.length) return;
  touchTooth = e.touches[0].identifier;
  setCursor(e.touches[0].clientX, e.touches[0].clientY);
  if (toothCursor) toothCursor.style.display = 'block';
}, { passive: true });

window.addEventListener('touchmove', e => {
  for (const t of e.touches) {
    if (t.identifier === touchTooth) {
      setCursor(t.clientX, t.clientY);
      break;
    }
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  touchTooth = null;
  if (toothCursor && matchMedia('(pointer:coarse)').matches) toothCursor.style.display = 'none';
}, { passive: true });
