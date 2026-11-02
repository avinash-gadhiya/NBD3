export const initialMusicState = {
  fileName: '', playing: false, loading: false, volume: .35, error: '',
};

const AUDIO_EXTENSION = /\.(mp3|wav|wave|ogg|oga|opus|m4a|aac|flac|webm|mp4)$/i;
const PLAYBACK_ERROR = 'This song could not be played. Try an MP3, WAV, OGG or M4A file.';

// Local object URLs play the chosen file without uploading it to a server.
export function createMusicController(audio, onChange, {
  createUrl = file => URL.createObjectURL(file),
  revokeUrl = url => URL.revokeObjectURL(url),
} = {}) {
  let state = { ...initialMusicState }, url = null, request = 0, destroyed = false;
  audio.loop = true;
  audio.preload = 'metadata';
  audio.volume = state.volume;

  function emit(patch) {
    if (destroyed) return;
    state = { ...state, ...patch };
    onChange(state);
  }

  async function play() {
    if (!url || destroyed) return;
    const version = request;
    emit({ loading: true, error: '' });
    try {
      await audio.play();
    } catch (error) {
      if (destroyed || version !== request) return;
      if (error.name !== 'AbortError') {
        emit({ playing: false, error: error.name === 'NotAllowedError'
          ? 'Your song is ready. Press Play to start it.' : PLAYBACK_ERROR });
      }
    } finally {
      if (!destroyed && version === request) emit({ loading: false });
    }
  }

  function onPlaying() {
    if (url && !audio.paused) emit({ playing: true, loading: false, error: '' });
  }
  function onPause() { emit({ playing: false }); }
  function onError() {
    if (url && audio.error) emit({ playing: false, loading: false, error: PLAYBACK_ERROR });
  }
  function pause() {
    if (destroyed) return;
    ++request;
    audio.pause();
    emit({ playing: false, loading: false });
  }
  audio.addEventListener('playing', onPlaying);
  audio.addEventListener('pause', onPause);
  audio.addEventListener('error', onError);

  return {
    async selectFile(file) {
      if (!file || destroyed) return false;
      if (!file.type?.startsWith('audio/') && !AUDIO_EXTENSION.test(file.name || '')) {
        emit({ error: 'Choose an audio file, such as MP3, WAV, OGG or M4A.' });
        return false;
      }
      let nextUrl;
      try { nextUrl = createUrl(file); }
      catch { emit({ error: 'This file could not be opened. Please choose it again.' }); return false; }
      ++request;
      audio.pause();
      const previous = url;
      url = nextUrl;
      audio.src = url;
      if (previous) revokeUrl(previous);
      emit({ fileName: file.name, playing: false, error: '' });
      await play();
      return true;
    },
    togglePlayback() {
      if (!url || destroyed) return;
      if (!audio.paused || state.loading) {
        pause();
      } else return play();
    },
    pause,
    setVolume(value) {
      const number = Number(value);
      if (!Number.isFinite(number) || destroyed) return;
      const volume = Math.min(1, Math.max(0, number));
      audio.volume = volume;
      emit({ volume });
    },
    destroy() {
      destroyed = true;
      ++request;
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (url) revokeUrl(url);
      url = null;
    },
  };
}
