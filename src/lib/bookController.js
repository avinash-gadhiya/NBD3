import { bifold, rightPageFold, toMatrix3d } from './foldGeometry.js';
import { clamp, smootherstep } from './math.js';
import { createButterflyFlight } from './butterflyFlight.js';

const FLIGHT_STATUS = 'Two folded paper butterflies take flight around your birthday book.';
const PORTRAIT_FOLD = { width: 145, height: 295, beta: 22, origin: [380, 278, 1.2] };
const rad = Math.PI / 180;

export const initialUi = {
  opened: false,
  page: 1,
  cueHidden: false,
  replayVisible: false,
  view: 'front',
  fullscreen: false,
  flightStatus: '',
};

// Rising angle of a figure hinged along its base: upright when its spread lies flat.
const figureAngle = spread => Math.asin(Math.sin(spread * rad / 2)) / rad;

/*
 * Drives the 3D book imperatively, one style write per frame. Two values animate:
 * progress (cover opening, 0..1) and turn (two sequential leaves, 0..2). Each spread's pop-ups
 * fold from the angle between its two pages. Low-frequency UI state is reported
 * through onUiChange so React can render it.
 */
export function createBookController(els, onUiChange) {
  const {
    viewer, scene, book, cover, leaf, leafTwo, pageTwo, pageThree, deskShadow, sky,
    portrait, portraitLeft, portraitRight, cat, cake, cakeLeft, cakeRight,
    selfStand, selfLeft, selfRight, mirror, puppy,
    thirdStand, thirdLeft, thirdRight, thirdSelf,
  } = els;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flight = createButterflyFlight(sky, { reduced });
  let progress = 0, target = 0, turn = 0, turnTarget = 0;
  let coverTween = null, turnTween = null;
  let zoom = 1, panX = 0, panY = 0, yaw = -9, tilt = 50;
  let cameraTouched = false, dragged = false, hasFlown = false;
  let view = 'front', flightStatus = '';
  let ui = { ...initialUi };

  function emit(patch) {
    let changed = false;
    for (const key in patch) if (ui[key] !== patch[key]) { changed = true; break; }
    if (!changed) return;
    ui = { ...ui, ...patch };
    onUiChange(ui);
  }

  function foldSpread(alpha, { stand, left, right, figures }) {
    const fold = bifold(alpha, PORTRAIT_FOLD);
    left.style.transform = toMatrix3d(fold.left);
    right.style.transform = toMatrix3d(fold.right);
    left.style.setProperty('--fold-light', String(.08 + .07 * Math.sin(alpha * rad)));
    const visible = alpha > .2 ? 'visible' : 'hidden';
    stand.style.visibility = visible;
    for (const figure of figures) {
      figure.style.transform = `translateZ(1px) rotateX(${-figureAngle(alpha)}deg)`;
      figure.style.visibility = visible;
    }
    return visible;
  }

  function render() {
    const coverAngle = 180 * progress;
    const leafAngle = Math.min(180 * clamp(turn, 0, 1), coverAngle);
    const secondLeafAngle = Math.min(180 * clamp(turn - 1, 0, 1), leafAngle);
    const spreadOne = coverAngle - leafAngle;
    const spreadTwo = leafAngle - secondLeafAngle;
    const spreadThree = secondLeafAngle;
    // Stack unturned sheets on the right and turned sheets above the left pile.
    cover.style.transform = `translateZ(${6 * (1 - progress)}px) rotateY(${-coverAngle}deg)`;
    leaf.style.transform = `translateZ(4px) rotateY(${-leafAngle}deg)`;
    leafTwo.style.transform = `translateZ(${2 + secondLeafAngle / 45}px) rotateY(${-secondLeafAngle}deg)`;
    // Whichever page the leaf lies on is hidden under it; keep it from catching clicks.
    cover.style.pointerEvents = leafAngle > 90 ? 'none' : '';
    pageTwo.style.pointerEvents = leafAngle < 90 || secondLeafAngle > 90 ? 'none' : '';
    pageThree.style.pointerEvents = secondLeafAngle < 90 ? 'none' : '';
    // Page 1 pop-ups ride on the leaf and fold between the cover and the leaf.
    const pageOneVisible = foldSpread(spreadOne, { stand: portrait, left: portraitLeft, right: portraitRight, figures: [cat] });
    // Leave the bottom of the page clear for the message, below both cake panels.
    const cakeFold = rightPageFold(spreadOne, { width: 52.5, height: 126, beta: 18, origin: [650, 352, 1.3] });
    cakeLeft.style.transform = toMatrix3d(cakeFold.left);
    cakeRight.style.transform = toMatrix3d(cakeFold.right);
    cake.style.visibility = pageOneVisible;
    // Page 2 rides on the second leaf; page 3 folds against the fixed final page.
    foldSpread(spreadTwo, { stand: selfStand, left: selfLeft, right: selfRight, figures: [mirror, puppy] });
    foldSpread(spreadThree, { stand: thirdStand, left: thirdLeft, right: thirdRight, figures: [thirdSelf] });
    // Paper shading strengthens with elevation, never changing panel size.
    leaf.style.setProperty('--hinge-shade', String(.22 * Math.sin(spreadOne * rad)));
    leafTwo.style.setProperty('--hinge-shade', String(.22 * Math.sin(spreadTwo * rad)));
    pageThree.style.setProperty('--hinge-shade', String(.22 * Math.sin(spreadThree * rad)));
    book.style.transform = `translateX(${-190 * (1 - progress)}px)`;
    const raised = Math.max(Math.sin(coverAngle * rad), Math.sin(leafAngle * rad), Math.sin(secondLeafAngle * rad));
    const fit = Math.min(1.75, (viewer.clientWidth - 44) / 850, (viewer.clientHeight - 160) / (560 * (1 + .65 * raised)));
    const cameraTilt = cameraTouched ? tilt : 50;
    scene.style.transform = `translate(-50%,-50%) translate(${panX}px,${panY - 5}px) scale(${fit * zoom}) rotateX(${cameraTilt}deg) rotateZ(${yaw}deg)`;
    deskShadow.style.transform = `translate(calc(-50% + ${panX}px),calc(-50% + ${panY}px)) scale(${fit * zoom})`;
    if (progress > .16 && !hasFlown) launchButterflies();
    emit({
      opened: target === 1,
      page: turnTarget + 1,
      cueHidden: progress > .05,
      replayVisible: hasFlown,
      view,
      flightStatus,
    });
  }

  // Smootherstep tween of one value; duration scales with the distance travelled.
  function tween(from, to, apply, onDone) {
    const handle = { raf: 0 };
    const t0 = performance.now(), duration = reduced ? 1 : Math.max(450, 1900 * Math.abs(to - from));
    const step = now => {
      const t = clamp((now - t0) / duration, 0, 1);
      apply(from + (to - from) * smootherstep(t));
      render();
      if (t < 1) handle.raf = requestAnimationFrame(step);
      else { handle.raf = 0; onDone?.(); }
    };
    handle.raf = requestAnimationFrame(step);
    return handle;
  }

  function cancel(handle) { if (handle) cancelAnimationFrame(handle.raf); }

  function animateCover(value) {
    cancel(coverTween);
    coverTween = tween(progress, value, v => { progress = v; });
  }

  function animateTurn(value, onDone) {
    cancel(turnTween);
    turnTarget = value;
    turnTween = tween(turn, value, v => { turn = v; }, onDone);
  }

  function openBook() {
    target = 1;
    animateCover(1);
  }

  // Close from any page: turn back to page 1 first, then fold the cover shut.
  function closeBook() {
    target = 0;
    if (turn > 0 || turnTarget) animateTurn(0, () => { if (target === 0) animateCover(0); });
    else animateCover(0);
    render();
  }

  function toggleBook() { if (target === 1) closeBook(); else openBook(); }

  function turnPage(value) {
    value = clamp(value, 0, 2);
    if (target !== 1 || turnTarget === value) return;
    animateTurn(value);
    render();
  }

  function reset() { zoom = 1; panX = panY = 0; yaw = -9; tilt = 50; cameraTouched = false; view = 'front'; render(); }

  function setView(next) {
    if (next === 'top') { tilt = 0; yaw = 0; } else { tilt = 50; yaw = -9; }
    cameraTouched = true; panX = panY = 0; view = next;
    render();
  }

  function zoomBy(factor) { zoom = clamp(zoom * factor, .5, 2.75); render(); }

  function launchButterflies() {
    hasFlown = true;
    flight.launch();
    flightStatus = FLIGHT_STATUS;
    emit({ replayVisible: true, flightStatus });
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Full screen is unavailable (e.g. inside an iframe); the scene already fills the window.
    }
  }

  // Once open, page clicks only navigate. Closing stays on the explicit control.
  function clickBook(zone) {
    if (target !== 1) openBook();
    else if (zone === 'next') turnPage(turnTarget + 1);
    else if (zone === 'prev') turnPage(turnTarget - 1);
  }

  function pageZone(element) {
    if (!book.contains(element)) return null;
    // Include the cover's inside and raised artwork, which are outside the page faces.
    if (element.closest('.leaf-back, .back, .half-left')) return 'prev';
    if (element.closest('.right-page, .cat-stand, .cake-half, .half-right')) return 'next';
    return 'book';
  }

  // Pointer, wheel and keyboard camera controls.
  const pointers = new Map();
  let startZone = null, lastX = 0, lastY = 0, startX = 0, startY = 0, mode = 'rotate', pinchDistance = 0, pinchCenter;

  function onWheel(e) { e.preventDefault(); zoomBy(Math.exp(-e.deltaY * .0012)); }
  function onContextMenu(e) { e.preventDefault(); }

  function onPointerDown(e) {
    if (e.target.closest('button')) return;
    startZone = pageZone(e.target);
    viewer.focus({ preventScroll: true });
    viewer.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    lastX = startX = e.clientX; lastY = startY = e.clientY;
    dragged = false;
    mode = e.shiftKey || e.button === 2 || e.button === 1 ? 'pan' : 'rotate';
    viewer.classList.add('dragging');
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDistance = Math.hypot(a[0] - b[0], a[1] - b[1]);
      pinchCenter = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    }
  }

  function onPointerMove(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (Math.hypot(e.clientX - startX, e.clientY - startY) > 4) dragged = true;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()], dist = Math.hypot(a[0] - b[0], a[1] - b[1]), center = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (pinchDistance > 0) zoom = clamp(zoom * dist / pinchDistance, .5, 2.75);
      if (pinchCenter) { panX = clamp(panX + center[0] - pinchCenter[0], -700, 700); panY = clamp(panY + center[1] - pinchCenter[1], -500, 500); }
      pinchDistance = dist; pinchCenter = center; dragged = true;
    } else {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (mode === 'pan' || e.shiftKey) {
        panX = clamp(panX + dx, -700, 700); panY = clamp(panY + dy, -500, 500);
      } else {
        if (!cameraTouched) tilt = 50;
        cameraTouched = true;
        // Turn so the front of the book follows the pointer.
        yaw = clamp(yaw - dx * .28, -85, 85);
        tilt = clamp(tilt - dy * .25, 0, 78);
        view = null;
      }
    }
    lastX = e.clientX; lastY = e.clientY;
    render();
  }

  function onPointerEnd(e) {
    if (!pointers.has(e.pointerId)) return;
    const click = !dragged && pointers.size === 1 && e.type === 'pointerup' && e.button === 0;
    pointers.delete(e.pointerId);
    pinchDistance = 0; pinchCenter = null;
    if (pointers.size) { const [p] = pointers.values(); lastX = p[0]; lastY = p[1]; dragged = true; }
    else viewer.classList.remove('dragging');
    if (click && startZone && mode === 'rotate' && !e.shiftKey) clickBook(startZone);
  }

  function onKeyDown(e) {
    if (e.target !== viewer) return;
    const actions = {
      ArrowLeft: () => { yaw += 5; }, ArrowRight: () => { yaw -= 5; }, ArrowUp: () => { tilt -= 5; }, ArrowDown: () => { tilt += 5; },
      '+': () => zoomBy(1.15), '=': () => zoomBy(1.15), '-': () => zoomBy(1 / 1.15), Home: reset, ' ': toggleBook,
      PageDown: () => turnPage(turnTarget + 1), PageUp: () => turnPage(turnTarget - 1),
    };
    if (actions[e.key]) {
      e.preventDefault();
      if (e.key.startsWith('Arrow')) cameraTouched = true;
      actions[e.key]();
      tilt = clamp(tilt, 0, 78); yaw = clamp(yaw, -85, 85);
      render();
    }
  }

  function onFullscreenChange() { emit({ fullscreen: !!document.fullscreenElement }); render(); }

  viewer.addEventListener('wheel', onWheel, { passive: false });
  viewer.addEventListener('contextmenu', onContextMenu);
  viewer.addEventListener('pointerdown', onPointerDown);
  viewer.addEventListener('pointermove', onPointerMove);
  viewer.addEventListener('pointerup', onPointerEnd);
  viewer.addEventListener('pointercancel', onPointerEnd);
  viewer.addEventListener('keydown', onKeyDown);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  const resizeObserver = new ResizeObserver(render);
  resizeObserver.observe(viewer);
  render();

  return {
    toggleBook,
    turnPage: (direction = 1) => turnPage(turnTarget + direction),
    reset,
    setView,
    toggleFullscreen,
    replayButterflies: launchButterflies,
    destroy() {
      cancel(coverTween);
      cancel(turnTween);
      flight.destroy();
      resizeObserver.disconnect();
      viewer.removeEventListener('wheel', onWheel);
      viewer.removeEventListener('contextmenu', onContextMenu);
      viewer.removeEventListener('pointerdown', onPointerDown);
      viewer.removeEventListener('pointermove', onPointerMove);
      viewer.removeEventListener('pointerup', onPointerEnd);
      viewer.removeEventListener('pointercancel', onPointerEnd);
      viewer.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      viewer.classList.remove('dragging');
    },
  };
}
