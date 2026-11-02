import { useEffect, useId, useRef, useState } from 'react';
import { useMusicPlayer } from '../hooks/useMusicPlayer.js';
import { parseYouTubeVideoId } from '../lib/youtube.js';
import YouTubePlayer, { initialYouTubeState } from './YouTubePlayer.jsx';
import GlassButton from './GlassButton.jsx';
import { ExternalLink, LoaderCircle, Music, Pause, Play, X } from 'lucide-react';
import Icon from './Icon.jsx';

export default function MusicControl() {
  const { audioRef, music, actions } = useMusicPlayer();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState('youtube');
  const [link, setLink] = useState(''), [linkError, setLinkError] = useState('');
  const [videoId, setVideoId] = useState(''), [videoRequest, setVideoRequest] = useState(0);
  const [editing, setEditing] = useState(true), [youtube, setYouTube] = useState(initialYouTubeState);
  const youtubeRef = useRef(null);
  const container = useRef(null), trigger = useRef(null), firstControl = useRef(null), picker = useRef(null);
  const panelId = useId(), titleId = useId(), volumeId = useId(), linkId = useId(), errorId = useId();
  const isYouTube = source === 'youtube';
  const keepPlayer = isYouTube && Boolean(videoId);
  const audible = isYouTube ? youtube.playing && music.volume > 0 : music.playing && music.volume > 0;
  const label = isYouTube ? videoId ? youtube.playing ? 'YouTube on' : 'YouTube' : 'Choose song' : !music.fileName ? 'Choose song' : audible ? 'Sound on' : 'Sound off';

  function close() { setOpen(false); trigger.current?.focus(); }
  function chooseSource(next) {
    if (next === source) return;
    if (next === 'youtube') actions.pause();
    else youtubeRef.current?.pause();
    setSource(next);
  }
  function removeYouTube() {
    youtubeRef.current?.pause();
    setVideoId(''); setYouTube(initialYouTubeState); setLink(''); setLinkError(''); setEditing(true);
    trigger.current?.focus();
  }
  function selectYouTube(event) {
    event.preventDefault();
    const id = parseYouTubeVideoId(link);
    if (!id) { setLinkError('Paste a YouTube video link. Use Find on YouTube to search for your song.'); return; }
    actions.pause();
    setLinkError(''); setYouTube({ ...initialYouTubeState, loading: true });
    setVideoId(id); setVideoRequest(value => value + 1); setEditing(false);
  }
  function toggleYouTube() {
    if (youtube.playing || youtube.loading) youtubeRef.current?.pause();
    else youtubeRef.current?.play();
  }
  useEffect(() => {
    if (!open) return;
    firstControl.current?.focus({ preventScroll: true });
    const outside = event => { if (!container.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);

  function selectSong(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (file) void actions.selectFile(file);
  }
  function volumeControl() {
    return <div className="music-volume">
      <label htmlFor={volumeId}>Volume</label>
      <input id={volumeId} type="range" min="0" max="1" step="0.01" value={music.volume} aria-valuetext={`${Math.round(music.volume * 100)} percent`} onChange={event => actions.setVolume(event.target.value)} />
      <output htmlFor={volumeId}>{Math.round(music.volume * 100)}%</output>
    </div>;
  }
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(link && !parseYouTubeVideoId(link) && !link.includes('/') ? link : 'music')}`;

  return (
    <div className="music-control" ref={container}>
      <GlassButton ref={trigger} className="sound" data-playing={audible} aria-expanded={open} aria-controls={open ? panelId : undefined} aria-haspopup="dialog" onClick={() => setOpen(value => !value)}>
        <Icon icon={Music} size={16} /><span>{label}</span>
      </GlassButton>
      <input ref={picker} type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus" aria-label="Choose a song from your device" hidden onChange={selectSong} />
      <audio ref={audioRef} hidden />
      {(open || keepPlayer) && (
        <section className={`music-panel${keepPlayer ? ' music-panel--youtube' : ''}${!open ? ' music-panel--compact' : ''}`} id={panelId} role={open ? 'dialog' : 'region'} aria-labelledby={open ? titleId : undefined} aria-label={!open ? 'YouTube song player' : undefined}>
          <div hidden={!open}>
            <div className="music-panel-heading">
              <div><p className="music-eyebrow">A LITTLE BACKGROUND MUSIC</p><h2 id={titleId}>Your card, your soundtrack.</h2></div>
              <GlassButton className="music-close" aria-label={keepPlayer ? 'Minimize music controls' : 'Close music controls'} onClick={close}><Icon icon={X} size={16} /></GlassButton>
            </div>
            <div className="music-sources" role="group" aria-label="Choose a music source">
              <GlassButton aria-pressed={isYouTube} onClick={() => chooseSource('youtube')}>YouTube</GlassButton>
              <GlassButton aria-pressed={!isYouTube} onClick={() => chooseSource('device')}>From device</GlassButton>
            </div>
          </div>
          {isYouTube ? (
            <div className="youtube-content">
              {open && (editing || !videoId) && (
                <form className="youtube-form" onSubmit={selectYouTube}>
                  <label htmlFor={linkId}>YouTube song link</label>
                  <input ref={firstControl} id={linkId} type="text" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck="false" placeholder="Paste a YouTube link…" value={link} aria-invalid={Boolean(linkError)} aria-describedby={linkError ? errorId : undefined} onChange={event => { setLink(event.target.value); setLinkError(''); }} />
                  {linkError && <p className="music-error" id={errorId} role="alert">{linkError}</p>}
                  <GlassButton className="music-primary" type="submit"><Icon icon={Play} />Play from YouTube</GlassButton>
                  <a className="music-link" href={searchUrl} target="_blank" rel="noopener noreferrer">Find a song on YouTube<Icon icon={ExternalLink} size={12} /></a>
                  <p className="youtube-help">Find your song, copy its link, and paste it here.</p>
                </form>
              )}
              {videoId && (
                <div className="youtube-track">
                  <div className="youtube-mini-heading" hidden={open}>
                    <span>Your YouTube song</span>
                    <GlassButton className="music-mini-edit" onClick={() => setOpen(true)}>Edit</GlassButton>
                    <GlassButton className="music-close" aria-label="Stop and remove YouTube song" onClick={removeYouTube}><Icon icon={X} size={16} /></GlassButton>
                  </div>
                  <YouTubePlayer key={videoRequest} ref={youtubeRef} videoId={videoId} volume={music.volume} onChange={patch => setYouTube(value => ({ ...value, ...patch }))} />
                  <p className="music-status youtube-status" aria-live="polite">{youtube.loading ? youtube.ready ? 'Buffering…' : 'Connecting to YouTube…' : youtube.playing ? 'Playing on YouTube' : 'Press Play to start or resume.'}</p>
                  {youtube.notice && <p className="youtube-notice">{youtube.notice}</p>}
                  {youtube.error && <p className="music-error" role="alert">{youtube.error}</p>}
                  <div hidden={!open}>
                    <div className="music-actions">
                      <GlassButton ref={!editing ? firstControl : undefined} className="music-primary" disabled={!youtube.ready || Boolean(youtube.error)} onClick={toggleYouTube}><Icon icon={youtube.playing || youtube.loading ? Pause : Play} />{youtube.playing || youtube.loading ? 'Pause song' : 'Play song'}</GlassButton>
                      <GlassButton className="music-change" onClick={() => setEditing(value => !value)}>Change song</GlassButton>
                    </div>
                    {volumeControl()}
                    <a className="music-link" href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">Open this song on YouTube<Icon icon={ExternalLink} size={12} /></a>
                  </div>
                </div>
              )}
              <p className="music-privacy" hidden={!open || !videoId}>Minimize the controls to keep a small player beside your card.</p>
            </div>
          ) : (
            <div className="device-content">
              {!music.fileName ? <>
                <p className="music-description">Choose a song from your device. It will play on repeat while you explore.</p>
                <GlassButton ref={firstControl} className="music-primary music-file-choose" onClick={() => picker.current?.click()}><Icon icon={Music} />Choose a song</GlassButton>
                <p className="music-formats">MP3, WAV, OGG or M4A</p>
              </> : <>
                <div className="music-track"><span className="music-note" aria-hidden="true"><Icon icon={Music} size={22} /></span><div>
                  <p className="music-track-name" title={music.fileName}>{music.fileName.replace(/\.[^.]+$/, '')}</p>
                  <p className="music-status" aria-live="polite">{music.loading ? 'Loading your song…' : music.playing ? music.volume === 0 ? 'Playing · muted' : 'Playing on repeat' : 'Paused'}</p>
                </div></div>
                <div className="music-actions">
                  <GlassButton ref={firstControl} className="music-primary" disabled={music.loading} onClick={actions.togglePlayback}><Icon icon={music.loading ? LoaderCircle : music.playing ? Pause : Play} className={music.loading ? 'icon-spin' : ''} />{music.loading ? 'Loading…' : music.playing ? 'Pause song' : 'Play song'}</GlassButton>
                  <GlassButton className="music-change" onClick={() => picker.current?.click()}>Change song</GlassButton>
                </div>
                {volumeControl()}
              </>}
              {music.error && <p className="music-error" role="alert">{music.error}</p>}
              <p className="music-privacy">Your song stays on your device.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
