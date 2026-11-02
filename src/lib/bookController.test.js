import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookController, initialUi } from './bookController.js';

function element() {
  return {
    style: { setProperty(name, value) { this[name] = value; } },
    listeners: {},
    classList: { add() {}, remove() {} },
    clientWidth: 1024, clientHeight: 768,
    addEventListener(name, fn) { this.listeners[name] = fn; },
    removeEventListener(name) { delete this.listeners[name]; },
    appendChild() {}, replaceChildren() {}, focus() {}, setPointerCapture() {},
    contains() { return true; },
  };
}

function setup(t, reduced = false) {
  const frames = new Map();
  let frameId = 0, now = 0, ui = initialUi;
  t.mock.method(performance, 'now', () => now);
  const globals = {
    matchMedia: () => ({ matches: reduced }),
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
    ResizeObserver: class { observe() {} disconnect() {} },
    document: { ...element(), createElement: element },
    innerWidth: 1024, innerHeight: 768,
  };
  const previous = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  const names = ['viewer', 'scene', 'book', 'cover', 'leaf', 'leafTwo', 'pageTwo', 'pageThree', 'deskShadow', 'sky',
    'portrait', 'portraitLeft', 'portraitRight', 'cat', 'cake', 'cakeLeft', 'cakeRight',
    'selfStand', 'selfLeft', 'selfRight', 'mirror', 'puppy', 'thirdStand', 'thirdLeft', 'thirdRight', 'thirdSelf'];
  const els = Object.fromEntries(names.map(name => [name, element()]));
  els.book.contains = target => target.inBook !== false;
  const controller = createBookController(els, next => { ui = next; });
  t.after(() => {
    controller.destroy();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  function advance(ms = 2000) {
    now += ms;
    const batch = [...frames.values()];
    frames.clear();
    batch.forEach(fn => fn(now));
    for (const el of Object.values(els)) {
      assert.doesNotMatch(el.style.transform ?? '', /NaN|Infinity/, 'Every frame has finite fold geometry');
    }
  }
  function visiblePage(page) {
    assert.equal(ui.page, page);
    for (const [i, name] of ['portrait', 'selfStand', 'thirdStand'].entries()) {
      assert.equal(els[name].style.visibility, i + 1 === page ? 'visible' : 'hidden');
    }
  }
  function pointerTarget(...classes) {
    return { closest: selector => selector.split(',').some(part => classes.includes(part.trim())) ? {} : null };
  }
  function click(...classes) {
    const target = pointerTarget(...classes);
    els.viewer.listeners.pointerdown({ target, pointerId: 1, clientX: 500, clientY: 300, button: 0 });
    els.viewer.listeners.pointerup({ target, pointerId: 1, type: 'pointerup', button: 0 });
    advance();
  }
  return { controller, els, advance, visiblePage, pointerTarget, click, get ui() { return ui; } };
}

test('navigates all three spreads in both directions and clamps at the ends', t => {
  const h = setup(t);
  h.controller.turnPage();
  assert.equal(h.ui.opened, false);
  h.controller.toggleBook(); h.advance(); h.visiblePage(1);
  h.controller.turnPage(-1); h.advance(); h.visiblePage(1);
  h.controller.turnPage(); h.advance(); h.visiblePage(2);
  h.controller.turnPage(); h.advance(); h.visiblePage(3);
  assert.match(h.els.leafTwo.style.transform, /translateZ\(6px\) rotateY\(-180deg\)/);
  h.controller.turnPage(); h.advance(); h.visiblePage(3);
  h.controller.turnPage(-1); h.advance(); h.visiblePage(2);
  h.controller.turnPage(-1); h.advance(); h.visiblePage(1);
});

test('closing from page 3 folds both leaves before the cover and reopens page 1', t => {
  const h = setup(t);
  h.controller.toggleBook(); h.advance();
  h.controller.turnPage(); h.advance(); h.controller.turnPage(); h.advance();
  h.controller.toggleBook(); h.advance(4000); h.advance();
  assert.equal(h.ui.opened, false);
  assert.match(h.els.cover.style.transform, /rotateY\(0deg\)/);
  for (const name of ['portrait', 'selfStand', 'thirdStand', 'thirdSelf']) assert.equal(h.els[name].style.visibility, 'hidden');
  h.controller.toggleBook(); h.advance(); h.visiblePage(1);
});

test('keyboard PageDown and PageUp navigate every spread with reduced motion', t => {
  const h = setup(t, true);
  const key = name => { h.els.viewer.listeners.keydown({ target: h.els.viewer, key: name, preventDefault() {} }); h.advance(5); };
  key(' '); h.visiblePage(1);
  key('PageDown'); h.visiblePage(2);
  key('PageDown'); h.visiblePage(3);
  key('PageDown'); h.visiblePage(3);
  key('PageUp'); h.visiblePage(2);
  key('PageUp'); h.visiblePage(1);
});

test('rapid navigation and reversing an in-flight turn finish on the requested spread', t => {
  const h = setup(t);
  h.controller.toggleBook(); h.advance();
  h.controller.turnPage(); h.advance(400);
  h.controller.turnPage(); h.advance(400);
  h.controller.turnPage(-1); h.advance(4000); h.visiblePage(2);
  h.controller.turnPage(); h.advance(4000); h.visiblePage(3);
});

test('clicking right pages and left page backs follows the three-page sequence', t => {
  const h = setup(t);
  h.click('.front'); h.visiblePage(1);
  h.click('.back'); h.visiblePage(1);
  assert.equal(h.ui.opened, true, 'The first left page does not close the book');
  h.click('.right-page', '.leaf-front'); h.visiblePage(2);
  h.click('.right-page', '.leaf-front', '.page-two'); h.visiblePage(3);
  h.click('.right-page', '.page-three'); h.visiblePage(3);
  assert.equal(h.ui.opened, true, 'The final right page does not close the book');
  h.click('.leaf-back'); h.visiblePage(2);
  h.click('.leaf-back'); h.visiblePage(1);
  h.click('.spine'); h.visiblePage(1);
  assert.equal(h.ui.opened, true, 'Other book surfaces do not close the book');
});

test('raised portraits, figures and cake navigate without closing the book', t => {
  const h = setup(t);
  h.click('.front');
  for (const artwork of ['.half-right', '.cat-stand', '.cake-half']) {
    h.click(artwork); h.visiblePage(2);
    h.click('.half-right'); h.visiblePage(3);
    h.click('.cat-stand'); h.visiblePage(3);
    h.click('.half-left'); h.visiblePage(2);
    h.click('.half-left'); h.visiblePage(1);
    h.click('.half-left'); h.visiblePage(1);
    assert.equal(h.ui.opened, true);
  }
});

test('dragging, cancelled pointers, modified clicks and background clicks do not turn pages', t => {
  const h = setup(t);
  h.click('.front');
  const target = h.pointerTarget('.right-page');
  const down = { target, pointerId: 1, clientX: 500, clientY: 300, button: 0 };
  const up = { ...down, type: 'pointerup' };
  h.els.viewer.listeners.pointerdown(down);
  h.els.viewer.listeners.pointermove({ ...down, clientX: 530 });
  h.els.viewer.listeners.pointerup(up);
  h.advance(); h.visiblePage(1);
  assert.equal(h.ui.opened, true);

  h.els.viewer.listeners.pointerdown(down);
  h.els.viewer.listeners.pointercancel({ ...up, type: 'pointercancel' });
  h.advance(); h.visiblePage(1);

  h.els.viewer.listeners.pointerdown({ ...down, shiftKey: true });
  h.els.viewer.listeners.pointerup({ ...up, shiftKey: true });
  h.advance(); h.visiblePage(1);

  const background = { ...h.pointerTarget(), inBook: false };
  h.els.viewer.listeners.pointerdown({ ...down, target: background });
  h.els.viewer.listeners.pointerup({ ...up, target: background });
  h.advance(); h.visiblePage(1);
  assert.equal(h.ui.opened, true);
});
