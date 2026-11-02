import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseYouTubeVideoId, youtubePlaybackError } from './youtube.js';

const id = 'M7lc1UVf-VE';

test('accepts YouTube watch, share, music, Shorts, live, and embed links', () => {
  for (const link of [
    `https://www.youtube.com/watch?v=${id}&list=PLtest`,
    `https://youtu.be/${id}?si=share-code`,
    `youtube.com/watch?v=${id}`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://music.youtube.com/watch?v=${id}`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/live/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
    `  ${id}  `,
  ]) assert.equal(parseYouTubeVideoId(link), id, link);
});

test('rejects other sites, deceptive hosts, scripts, search queries, and malformed video IDs', () => {
  for (const link of [
    '', null, 'a birthday song', 'https://example.com/watch?v=' + id,
    `https://youtube.com.example.com/watch?v=${id}`,
    `https://youtube.com@evil.example/watch?v=${id}`,
    `https://person@youtube.com/watch?v=${id}`,
    `javascript:alert('${id}')`,
    'https://www.youtube.com/playlist?list=PLtest',
    'https://www.youtube.com/watch?v=short',
    'https://youtu.be/not-a-valid-video-id',
  ]) assert.equal(parseYouTubeVideoId(link), null, String(link));
});

test('unavailable and embedding-disabled videos provide a useful fallback message', () => {
  assert.match(youtubePlaybackError(100), /unavailable or private/);
  for (const code of [101, 150]) assert.match(youtubePlaybackError(code), /cannot play here/);
  assert.match(youtubePlaybackError(2), /not a valid YouTube video/);
  assert.match(youtubePlaybackError(153), /open it on YouTube/);
});
