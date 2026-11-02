import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMusicController, initialMusicState } from './musicController.js';

function setup(t) {
  let state = initialMusicState, changes = 0;
  const listeners = new Map(), revoked = [], created = [];
  const audio = {
    paused: true, src: '', currentTime: 42, error: null, failure: null, playCalls: 0, loadCalls: 0,
    addEventListener(name, fn) { listeners.set(name, fn); },
    removeEventListener(name) { listeners.delete(name); },
    fire(name) { listeners.get(name)?.(); },
    play() {
      ++this.playCalls;
      if (this.failure) return Promise.reject(this.failure);
      this.paused = false; this.fire('playing'); return Promise.resolve();
    },
    pause() { this.paused = true; this.fire('pause'); },
    removeAttribute(name) { if (name === 'src') this.src = ''; },
    load() { ++this.loadCalls; },
  };
  const controller = createMusicController(audio, next => { state = next; ++changes; }, {
    createUrl(file) { const url = `blob:${created.length}/${file.name}`; created.push(url); return url; },
    revokeUrl(url) { revoked.push(url); },
  });
  t.after(() => controller.destroy());
  return { controller, audio, revoked, created, listeners, get state() { return state; }, get changes() { return changes; } };
}

test('music stays silent until an audio file is selected, then loops and can pause/resume', async t => {
  const h = setup(t);
  h.controller.togglePlayback();
  assert.equal(h.audio.playCalls, 0);
  assert.equal(await h.controller.selectFile({ name: 'birthday.wav', type: 'audio/wav' }), true);
  assert.equal(h.state.fileName, 'birthday.wav');
  assert.equal(h.state.playing, true);
  assert.equal(h.state.loading, false);
  assert.equal(h.audio.loop, true);
  assert.equal(h.audio.volume, .35);
  h.controller.togglePlayback();
  assert.equal(h.state.playing, false);
  await h.controller.togglePlayback();
  assert.equal(h.state.playing, true);
  assert.equal(h.audio.currentTime, 42, 'Pause/resume does not restart the song');
});

test('cancelled selections and invalid files preserve the existing song', async t => {
  const h = setup(t);
  await h.controller.selectFile({ name: 'first.mp3', type: '' });
  const source = h.audio.src;
  assert.equal(await h.controller.selectFile(null), false);
  assert.equal(await h.controller.selectFile({ name: 'photo.png', type: 'image/png' }), false);
  assert.equal(h.audio.src, source);
  assert.equal(h.state.playing, true);
  assert.match(h.state.error, /Choose an audio file/);
  assert.equal(h.created.length, 1);
});

test('changing songs and leaving the page release the local file URLs', async t => {
  const h = setup(t);
  await h.controller.selectFile({ name: 'first.mp3', type: 'audio/mpeg' });
  await h.controller.selectFile({ name: 'second.ogg', type: 'audio/ogg' });
  assert.deepEqual(h.revoked, [h.created[0]]);
  assert.equal(h.state.fileName, 'second.ogg');
  h.controller.destroy();
  assert.deepEqual(h.revoked, h.created);
  assert.equal(h.audio.src, '');
  assert.equal(h.listeners.size, 0);
  const changes = h.changes;
  h.audio.fire('playing');
  assert.equal(h.changes, changes);
});

test('blocked autoplay leaves the chosen song ready for an explicit Play click', async t => {
  const h = setup(t);
  h.audio.failure = Object.assign(new Error('User gesture required'), { name: 'NotAllowedError' });
  await h.controller.selectFile({ name: 'birthday.mp3', type: 'audio/mpeg' });
  assert.equal(h.state.playing, false);
  assert.equal(h.state.loading, false);
  assert.match(h.state.error, /Press Play/);
  h.audio.failure = null;
  await h.controller.togglePlayback();
  assert.equal(h.state.playing, true);
  assert.equal(h.state.error, '');
});

test('a late failure from an older song cannot replace the newly selected song state', async t => {
  const h = setup(t);
  let rejectFirst;
  const play = h.audio.play.bind(h.audio);
  h.audio.play = () => new Promise((_, reject) => { rejectFirst = reject; });
  const first = h.controller.selectFile({ name: 'first.mp3', type: 'audio/mpeg' });
  h.audio.play = play;
  await h.controller.selectFile({ name: 'second.mp3', type: 'audio/mpeg' });
  rejectFirst(new Error('Old song stopped'));
  await first;
  assert.equal(h.state.fileName, 'second.mp3');
  assert.equal(h.state.playing, true);
  assert.equal(h.state.error, '');
  assert.equal(h.state.loading, false);
});

test('volume changes are clamped and unsupported audio shows a usable error', async t => {
  const h = setup(t);
  h.controller.setVolume(2); assert.equal(h.audio.volume, 1);
  h.controller.setVolume(-1); assert.equal(h.audio.volume, 0);
  h.controller.setVolume('invalid'); assert.equal(h.audio.volume, 0);
  h.controller.setVolume('.6'); assert.equal(h.state.volume, .6);
  await h.controller.selectFile({ name: 'broken.mp3', type: 'audio/mpeg' });
  h.audio.error = { code: 3 };
  h.audio.fire('error');
  assert.equal(h.state.playing, false);
  assert.match(h.state.error, /could not be played/);
});

test('switching sources can pause a pending local song without a late playback error', async t => {
  const h = setup(t);
  let rejectPlay;
  h.audio.play = () => new Promise((_, reject) => { rejectPlay = reject; });
  const selection = h.controller.selectFile({ name: 'first.mp3', type: 'audio/mpeg' });
  h.controller.pause();
  rejectPlay(new Error('Playback cancelled for YouTube'));
  await selection;
  assert.equal(h.state.playing, false);
  assert.equal(h.state.loading, false);
  assert.equal(h.state.error, '');
});
