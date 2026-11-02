// One small flock visits all visible buttons. Flights use the browser's
// animation API; resting birds need no JavaScript animation loop.
export function createButtonBirds(layer) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const birds = [...layer.children].map((element, index) => ({ element, index, phase: 'away', button: null, previous: null, slot: .5, timer: null, animation: null }));
  let disposed = false;
  let frame;
  let pointer = null;
  const random = (min, max) => min + Math.random() * (max - min);
  const active = () => !disposed && !document.hidden && !motion.matches;
  const slots = button => button.offsetWidth < 64 ? [.5] : button.offsetWidth < 110 ? [.3, .7] : [.22, .5, .78];
  const position = bird => {
    const rect = bird.button.getBoundingClientRect();
    return { x: rect.left + rect.width * bird.slot, y: rect.top + 1 };
  };
  const transform = (point, extra = '') => `translate(${point.x.toFixed(2)}px, ${point.y.toFixed(2)}px) ${extra}`;

  function setPhase(bird, phase) {
    bird.phase = phase;
    bird.element.dataset.phase = phase;
  }
  function clearTimer(bird) {
    window.clearTimeout(bird.timer);
    bird.timer = null;
  }
  function later(bird, delay, action) {
    clearTimer(bird);
    if (!active()) return;
    bird.timer = window.setTimeout(() => {
      bird.timer = null;
      if (active()) action();
    }, delay);
  }
  function visible(button) {
    if (!button.isConnected || button.disabled || button.closest('.hs-keys, [hidden], [aria-hidden="true"]')) return false;
    const rect = button.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.left < 0 || rect.top < 16 || rect.right > innerWidth || rect.bottom > innerHeight) return false;
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return hit === button || button.contains(hit);
  }
  function distance(point, rect) {
    return Math.hypot(Math.max(rect.left - point.x, 0, point.x - rect.right), Math.max(rect.top - point.y, 0, point.y - rect.bottom));
  }
  function animate(bird, frames, duration, done) {
    bird.animation?.cancel();
    if (!bird.element.animate) {
      bird.element.style.transform = frames.at(-1).transform;
      done();
      return;
    }
    const animation = bird.element.animate(frames, { duration, easing: 'ease-in-out', fill: 'forwards' });
    bird.animation = animation;
    animation.finished.then(() => {
      if (disposed || bird.animation !== animation) return;
      bird.element.style.transform = frames.at(-1).transform;
      bird.animation = null;
      animation.cancel();
      done();
    }).catch(() => {}); // Cancellation is expected on resize, hiding, or unmount.
  }
  function arrive(bird) {
    if (!active()) return;
    const candidates = [...document.querySelectorAll('button')].filter(button => {
      if (!visible(button) || button.matches(':hover, :focus-visible')) return false;
      if (pointer && distance(pointer, button.getBoundingClientRect()) < 55) return false;
      return slots(button).some(slot => !birds.some(peer => peer !== bird && peer.button === button && peer.slot === slot && peer.phase !== 'flying'));
    });
    const choices = candidates.filter(button => button !== bird.previous);
    const targets = choices.length ? choices : candidates;
    if (!targets.length) { later(bird, random(1200, 2800), () => arrive(bird)); return; }
    bird.button = targets[Math.floor(Math.random() * targets.length)];
    const free = slots(bird.button).filter(slot => !birds.some(peer => peer !== bird && peer.button === bird.button && peer.slot === slot && peer.phase !== 'flying'));
    bird.slot = free[Math.floor(Math.random() * free.length)];
    bird.element.dataset.perch = bird.button.getAttribute('aria-label') || bird.button.textContent.trim();
    bird.element.dataset.alert = 'false';
    const target = position(bird);
    const direction = Math.random() < .5 ? -1 : 1;
    const from = { x: target.x + direction * random(70, 145), y: target.y - random(45, 85) };
    bird.element.style.setProperty('--bird-direction', String(-direction));
    setPhase(bird, 'arriving');
    animate(bird, [
      { offset: 0, transform: transform(from, 'scale(.7)'), opacity: 0 },
      { offset: .2, transform: transform({ x: from.x + (target.x - from.x) * .2, y: from.y }), opacity: 1 },
      { offset: .74, transform: transform({ x: target.x, y: target.y - 6 }), opacity: 1 },
      { offset: .9, transform: transform({ x: target.x, y: target.y + 1 }, 'scaleY(.88)'), opacity: 1 },
      { offset: 1, transform: transform(target), opacity: 1 },
    ], random(720, 1000), () => {
      if (!bird.button || !visible(bird.button)) { depart(bird); return; }
      bird.element.style.transform = transform(position(bird));
      setPhase(bird, 'perched');
      later(bird, random(2600, 6800), () => depart(bird));
    });
  }
  function depart(bird) {
    if (!active() || bird.phase === 'away' || bird.phase === 'flying') return;
    clearTimer(bird);
    const rect = bird.element.getBoundingClientRect();
    const from = { x: rect.left + rect.width / 2, y: rect.top + rect.height * .88 };
    const direction = Math.random() < .5 ? -1 : 1;
    const end = { x: from.x + direction * random(95, 180), y: from.y - random(60, 115) };
    bird.previous = bird.button;
    bird.button = null;
    bird.element.style.setProperty('--bird-direction', String(direction));
    setPhase(bird, 'flying');
    animate(bird, [
      { offset: 0, transform: transform(from), opacity: 1 },
      { offset: .12, transform: transform({ x: from.x, y: from.y + 2 }, 'scaleY(.85)'), opacity: 1 },
      { offset: .4, transform: transform({ x: from.x + (end.x - from.x) * .3, y: from.y - 24 }), opacity: 1 },
      { offset: 1, transform: transform(end, 'scale(.65)'), opacity: 0 },
    ], random(540, 760), () => {
      setPhase(bird, 'away');
      later(bird, random(1600, 4400), () => arrive(bird));
    });
  }
  function refresh() {
    if (!active()) return;
    for (const bird of birds) {
      if (!bird.button) continue;
      if (!visible(bird.button)) depart(bird);
      else if (bird.phase === 'perched') bird.element.style.transform = transform(position(bird));
    }
  }
  function move(event) {
    if (event.pointerType === 'touch' || !active()) return;
    pointer = { x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      for (const bird of birds) {
        if (!bird.button) continue;
        const near = distance(pointer, bird.button.getBoundingClientRect());
        bird.element.dataset.alert = String(near < 70);
        if (near < 18) depart(bird);
      }
    });
  }
  function press(event) {
    if (!active()) return;
    const button = event.target.closest?.('button');
    if (!button) return;
    for (const bird of birds) if (bird.button === button) depart(bird);
  }
  function leave() { pointer = null; }
  function restart() {
    cancelAnimationFrame(frame);
    frame = null;
    pointer = null;
    for (const bird of birds) {
      clearTimer(bird);
      bird.animation?.cancel();
      bird.animation = null;
      bird.button = null;
      setPhase(bird, 'away');
      later(bird, random(500, 2300) + bird.index * 550, () => arrive(bird));
    }
    layer.hidden = !active();
  }

  const observer = new MutationObserver(refresh);
  observer.observe(document.getElementById('root'), { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'disabled'] });
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', press, { passive: true });
  window.addEventListener('click', press);
  window.addEventListener('resize', restart);
  document.documentElement.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', restart);
  motion.addEventListener('change', restart);
  document.fonts?.ready.then(() => { if (!disposed) refresh(); });
  restart();

  return {
    destroy() {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      for (const bird of birds) { clearTimer(bird); bird.animation?.cancel(); }
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('click', press);
      window.removeEventListener('resize', restart);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', restart);
      motion.removeEventListener('change', restart);
    },
  };
}
