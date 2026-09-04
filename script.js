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

  // Stop video decode immediately on skip/error/end before revealing the heavy page effects.
  try { introVideo?.pause(); } catch (_) {}
  intro?.classList.add('transitioning');
  document.body.classList.add('cursor-active');

  setTimeout(() => {
    intro?.remove();
    // Only start painting/animating the desert world after the intro overlay is gone.
    document.body.classList.remove('intro-playing');
  }, 850);
}

if (intro && introVideo) {
  document.body.classList.add('intro-playing');
  introVideo.addEventListener('ended', finishIntro, { once: true });
  introVideo.addEventListener('error', finishIntro, { once: true });

  // If playback stalls for a long time, keep the skip button usable rather than
  // letting the page sit behind a frozen frame indefinitely.
  let stallTimer = null;
  const clearStallTimer = () => {
    if (stallTimer) clearTimeout(stallTimer);
    stallTimer = null;
  };
  introVideo.addEventListener('waiting', () => {
    clearStallTimer();
    stallTimer = setTimeout(() => {
      skip?.classList.add('show-stall-hint');
    }, 1800);
  });
  introVideo.addEventListener('playing', () => {
    clearStallTimer();
    skip?.classList.remove('show-stall-hint');
  });
  introVideo.addEventListener('canplay', clearStallTimer);

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

// Lore card 04: the previous repository blob was not a valid WebP.
// Load the verified 3D artwork from a text-safe base64 payload instead.
(async () => {
  const lore04 = document.querySelector('img[src*="lore-04-3d.webp"]');
  if (!lore04) return;
  try {
    const response = await fetch('assets/lore-04-3d.b64?v=1', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.text()).trim();
    if (!payload.startsWith('UklG')) throw new Error('Invalid WebP payload');
    lore04.src = `data:image/webp;base64,${payload}`;
  } catch (error) {
    console.error('TOOF lore 04 image failed to load', error);
  }
})();