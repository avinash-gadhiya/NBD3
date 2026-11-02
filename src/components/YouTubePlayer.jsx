import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { loadYouTubeApi, youtubePlaybackError } from '../lib/youtube.js';

export const initialYouTubeState = { ready: false, playing: false, loading: false, error: '', notice: '' };

const YouTubePlayer = forwardRef(function YouTubePlayer({ videoId, volume, onChange }, ref) {
  const host = useRef(null), player = useRef(null), callback = useRef(onChange), currentVolume = useRef(volume);
  callback.current = onChange;
  currentVolume.current = volume;

  useImperativeHandle(ref, () => ({
    play: () => player.current?.playVideo?.(),
    pause: () => player.current?.pauseVideo?.(),
  }), []);

  useEffect(() => {
    let active = true, instance;
    const container = host.current;
    const emit = patch => { if (active) callback.current(patch); };
    emit({ ...initialYouTubeState, loading: true });
    loadYouTubeApi().then(YT => {
      if (!active) return;
      const mount = document.createElement('div');
      container.replaceChildren(mount);
      instance = new YT.Player(mount, {
        width: '100%', height: '100%', videoId,
        playerVars: { origin: window.location.origin, playsinline: 1, controls: 1, autoplay: 0, loop: 1, playlist: videoId, rel: 0 },
        events: {
          onReady(event) {
            if (!active) return;
            const iframe = event.target.getIframe();
            iframe.title = 'Your selected YouTube song';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
            event.target.setVolume(Math.round(currentVolume.current * 100));
            emit({ ready: true, loading: false });
            event.target.playVideo();
          },
          onStateChange(event) {
            emit({ playing: event.data === 1, loading: event.data === 3,
              ...(event.data === 1 ? { error: '', notice: '' } : {}) });
          },
          onAutoplayBlocked() { emit({ playing: false, loading: false, notice: 'Press Play in the player to start your song.' }); },
          onError(event) { emit({ playing: false, loading: false, error: youtubePlaybackError(event.data) }); },
        },
      });
      player.current = instance;
    }).catch(error => emit({ playing: false, loading: false, error: error.message }));
    return () => {
      active = false;
      instance?.destroy();
      if (player.current === instance) player.current = null;
      container.replaceChildren();
    };
  }, [videoId]);

  useEffect(() => { player.current?.setVolume?.(Math.round(volume * 100)); }, [volume]);

  return <div className="youtube-frame" ref={host} />;
});

export default YouTubePlayer;
