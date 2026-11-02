const VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;
const HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);

export function parseYouTubeVideoId(input) {
  const text = String(input || '').trim();
  if (VIDEO_ID.test(text)) return text;
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    let id;
    if (url.hostname === 'youtu.be' || url.hostname === 'www.youtu.be') id = parts[0];
    else if (HOSTS.has(url.hostname)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v');
      else if (['embed', 'shorts', 'live'].includes(parts[0])) id = parts[1];
    }
    return VIDEO_ID.test(id || '') ? id : null;
  } catch { return null; }
}

export function youtubePlaybackError(code) {
  if (code === 100) return 'This video is unavailable or private. Try another YouTube link.';
  if (code === 101 || code === 150) return 'This video cannot play here. Try another link or open it on YouTube.';
  if (code === 2) return 'This is not a valid YouTube video. Please choose another link.';
  return 'YouTube could not play this video here. Try another link or open it on YouTube.';
}

let apiPromise;
export function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const previous = window.onYouTubeIframeAPIReady;
    const cleanup = () => {
      clearTimeout(timer);
      if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previous;
    };
    const fail = () => { cleanup(); script.remove(); reject(new Error('YouTube could not connect. Check your connection and try again.')); };
    const ready = () => {
      cleanup();
      try { previous?.(); } finally {
        if (window.YT?.Player) resolve(window.YT);
        else reject(new Error('YouTube is not ready. Please try again.'));
      }
    };
    const timer = setTimeout(fail, 15000);
    window.onYouTubeIframeAPIReady = ready;
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch(error => { apiPromise = null; throw error; });
  return apiPromise;
}
