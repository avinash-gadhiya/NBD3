import { clamp, spline } from './math.js';

// Pleated paper wings flap on independent 3D hinges and follow smooth flight paths.
const RIM = [[8, 40], [21, 14], [44, 1], [70, 7], [91, 27], [99, 49], [91, 66], [67, 77], [82, 95], [76, 119], [56, 135], [29, 128], [10, 106]];
const PATH = [[.51, .56], [.34, .35], [.15, .43], [.23, .18], [.62, .16], [.85, .30], [.82, .66], [.52, .72], [.27, .49], [.38, .22], [.73, .24], [.86, .52], [1.15, .22]];
const PALETTES = [['#2f88bc', '#216f9f', '#f4cf56', '#dca73a'], ['#eee9d8', '#c9dcd9', '#ecb6aa', '#d99686']];

function makeButterfly(sky, palette) {
  const fly = document.createElement('div');
  fly.className = 'paper-butterfly';
  const wings = [];
  for (let side = 0; side < 2; side++) {
    const wing = document.createElement('div');
    wing.className = 'origami-wing';
    fly.appendChild(wing);
    wings.push(wing);
    const id = 'fold' + Math.random().toString(36).slice(2);
    let panels = '';
    for (let j = 0; j < RIM.length - 1; j++) {
      const a = RIM[j], b = RIM[j + 1], innerA = [a[0] * .77, 74 + (a[1] - 74) * .77], innerB = [b[0] * .77, 74 + (b[1] - 74) * .77];
      panels += `<polygon points="0,74 ${a} ${b}" fill="${palette[j % 2]}"/><polygon points="0,74 ${innerA} ${innerB}" fill="${palette[2 + j % 2]}"/><polygon points="0,74 ${a} ${b}" fill="url(#${id})" opacity="${j % 2 ? .42 : .13}"/><path d="M0 74 L${a[0]} ${a[1]}" stroke="#fff7d5" stroke-opacity=".35" stroke-width=".6"/>`;
    }
    wing.innerHTML = `<svg class="wing-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffbea"/><stop offset=".46" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#183442"/></linearGradient></defs>${panels}</svg>`;
  }
  const body = document.createElement('div');
  body.className = 'butterfly-body';
  body.innerHTML = '<i class="antenna left"></i><i class="antenna right"></i>';
  fly.appendChild(body);
  sky.appendChild(fly);
  return { el: fly, wings };
}

export function createButterflyFlight(sky, { reduced }) {
  let flightRaf = 0;
  const butterflies = [];

  function launch() {
    cancelAnimationFrame(flightRaf);
    sky.replaceChildren();
    butterflies.length = 0;
    butterflies.push(...PALETTES.map(palette => makeButterfly(sky, palette)));
    const start = performance.now();
    function tick(now) {
      let active = false;
      const elapsed = (now - start) / 1000, w = innerWidth, h = innerHeight;
      butterflies.forEach((bf, i) => {
        const local = elapsed - i * .7, duration = reduced ? 4 : 17;
        const t = clamp(local / duration, 0, 1);
        if (local < 0 || t >= 1) { bf.el.style.visibility = 'hidden'; return; }
        active = true;
        bf.el.style.visibility = 'visible';
        const a = spline(PATH, t * (PATH.length - 1)), b = spline(PATH, Math.min(PATH.length - 1 - .0001, t * (PATH.length - 1) + .015)), mirror = i ? -1 : 1;
        const x = i ? 1 - a[0] : a[0], y = a[1] + (i ? .08 : 0);
        const heading = Math.atan2(b[1] - a[1], mirror * (b[0] - a[0])) * 180 / Math.PI + 90;
        const flap = reduced ? 25 : 30 + 43 * (.5 + .5 * Math.sin(local * 13 + i));
        const scale = Math.min(.75, w / 1500 + .22) * (t < .05 ? .35 + t * 13 : 1);
        bf.el.style.opacity = String(Math.min(1, local * 3, (1 - t) * 10));
        bf.el.style.transform = `translate3d(${x * w}px,${y * h}px,${40 + Math.sin(local * 1.2) * 65}px) rotateZ(${heading}deg) rotateX(${32 + Math.sin(local * 2) * 16}deg) rotateY(${Math.sin(local * 1.6) * 18}deg) scale(${scale})`;
        bf.wings[0].style.transform = `rotateY(${-flap}deg) scaleX(-1)`;
        bf.wings[1].style.transform = `rotateY(${flap}deg)`;
      });
      if (active || elapsed < 1) flightRaf = requestAnimationFrame(tick);
      else { sky.replaceChildren(); flightRaf = 0; }
    }
    flightRaf = requestAnimationFrame(tick);
  }

  function destroy() {
    cancelAnimationFrame(flightRaf);
    sky.replaceChildren();
  }

  return { launch, destroy };
}
