import { useEffect, useRef, useState } from 'react';
import GlassButton from './GlassButton.jsx';
import catDuo from '../assets/stickers/frog-shark-cats.png';
import pinkBow from '../assets/images/pink-bow.png';
import dietCoke from '../assets/stickers/diet-coke-can.png';
import { ImagePlus, LoaderCircle, Sticker, Trash2, Undo2, X } from 'lucide-react';
import Icon from './Icon.jsx';

const MAX_STICKERS = 10;
const MAX_BYTES = 20 * 1024 * 1024;
const STICKER_STYLES = [
  { finish: 'print', label: 'Classic', preview: dietCoke, cut: .035 },
  { finish: 'chrome', label: 'Holographic', preview: catDuo, cut: .05 },
  { finish: 'glitter', label: 'Glitter', preview: pinkBow, cut: .05 },
];

function placement(index, id) {
  if (id === 'desk-diet-coke') {
    if (window.innerWidth <= 750) {
      if (window.innerHeight < 760) {
        // Short phones use the gap beside the centered butterfly control.
        const center = (80 + (window.innerWidth - 104) / 2) / 2;
        return [center / window.innerWidth - .5, 174 / window.innerHeight - .5];
      }
      return [0, 238 / window.innerHeight - .5];
    }
    return [.34, -.08];
  }
  if (window.innerWidth <= 750) {
    const top = Math.min(210, Math.max(164, window.innerHeight * .22));
    return [(index % 2 ? 1 : -1) * .3, .5 - (top + Math.floor(index / 2) * 16) / window.innerHeight];
  }
  return [(index % 2 ? 1 : -1) * .35, .17 - Math.floor(index / 2) * .09];
}

function stickerScale() {
  return window.innerWidth <= 750 || (window.innerWidth <= 1000 && window.innerHeight <= 500) ? .62 : 1;
}

export default function StickerStudio({ onPointerClaimed }) {
  const canvasRoot = useRef(null);
  const picker = useRef(null);
  const board = useRef(null);
  const urls = useRef(new Map());
  const extras = useRef([]);
  const claimHandler = useRef(onPointerClaimed);
  const sequence = useRef(0);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState([]);
  const [stickerStyle, setStickerStyle] = useState(STICKER_STYLES[1]);
  const [status, setStatus] = useState('Loading stickers…');
  const [error, setError] = useState('');

  useEffect(() => { claimHandler.current = onPointerClaimed; }, [onPointerClaimed]);

  useEffect(() => {
    let disposed = false;
    let instance;
    let unbind = () => {};
    const ownedUrls = urls.current;

    async function initialize() {
      const base = `${import.meta.env.BASE_URL}vendor/`;
      const [{ createStickers }, { residue, bubbles }] = await Promise.all([
        import(/* @vite-ignore */ `${base}holo-stickers-1.0.0.min.js`),
        import(/* @vite-ignore */ `${base}holo-stickers-extras-1.0.0.min.js`),
      ]);
      // StrictMode's first effect is cleaned up before the imports resolve.
      if (disposed) return;
      instance = await createStickers({ container: canvasRoot.current, size: stickerScale(), intro: false });
      if (disposed) return;
      extras.current = [instance.use(residue()), instance.use(bubbles())];

      const cancelCamera = event => {
        if (event.defaultPrevented && instance.pointer.down) claimHandler.current(event.pointerId);
      };
      let mobileLayout = window.innerWidth <= 750;
      const keepOnScreen = () => {
        if (instance.pointer.down) return;
        instance.set({ size: stickerScale() });
        const layoutChanged = mobileLayout !== (window.innerWidth <= 750);
        mobileLayout = window.innerWidth <= 750;
        const state = instance.save();
        let changed = layoutChanged;
        for (const [index, sticker] of state.stickers.entries()) {
          if (layoutChanged) sticker.at = placement(index, sticker.id);
          const width = instance.get(sticker.id).def.width * stickerScale();
          const margin = Math.max(0, .5 - (width / 2 + 16) / window.innerWidth);
          const x = Math.max(-margin, Math.min(margin, sticker.at[0]));
          const y = Math.max(-.3, Math.min(.3, sticker.at[1]));
          changed ||= x !== sticker.at[0] || y !== sticker.at[1];
          sticker.at = [x, y];
        }
        if (changed) instance.restore(state).catch(error => console.error('Could not reposition stickers.', error));
      };
      window.addEventListener('pointerdown', cancelCamera);
      window.addEventListener('resize', keepOnScreen);
      unbind = () => {
        window.removeEventListener('pointerdown', cancelCamera);
        window.removeEventListener('resize', keepOnScreen);
      };

      const width = 136;
      await instance.add([
        { id: 'desk-cats', label: 'Frog and shark cats', src: catDuo, width, at: placement(0), rotation: -9, cut: .05, finish: 'chrome', material: 'vinyl' },
        { id: 'desk-bow', label: 'Pink bow', src: pinkBow, width: width * .8, at: placement(1), rotation: 12, cut: .05, finish: 'glitter', material: 'vinyl' },
        { id: 'desk-diet-coke', label: 'Diet Coke can', src: dietCoke, width: window.innerWidth <= 750 && window.innerHeight < 760 ? (window.innerWidth < 360 ? 32 : 64) : 80, at: placement(2, 'desk-diet-coke'), rotation: -8, cut: .035, finish: 'print', material: 'vinyl' },
      ]);
      if (disposed) return;
      board.current = instance;
      setItems(instance.list().map(({ id }) => id));
      setReady(true);
      setStatus('Stickers ready.');
    }

    const initialized = initialize().catch(error => {
      instance?.destroy();
      instance = null;
      if (!disposed) { setStatus(''); setError('Unable to load stickers. Please refresh.'); }
      console.error('Could not start the sticker studio.', error);
    });

    return () => {
      disposed = true;
      board.current = null;
      unbind();
      // If an image is still loading, let add() finish before destroying it.
      initialized.then(() => {
        instance?.destroy();
        for (const url of ownedUrls.values()) URL.revokeObjectURL(url);
        ownedUrls.clear();
      });
    };
  }, []);

  async function addImages(event) {
    const files = [...event.target.files];
    event.target.value = '';
    const instance = board.current;
    if (!instance || !files.length) return;
    setError('');
    setBusy(true);
    let added = 0;
    const problems = [];
    try {
      for (const file of files) {
        if (instance.list().filter(item => !item.id.includes('~')).length >= MAX_STICKERS) {
          problems.push(`There’s room for ${MAX_STICKERS} stickers. Remove one to add more.`);
          break;
        }
        if (!file.type.startsWith('image/')) { problems.push(`${file.name} is not an image.`); continue; }
        if (file.size > MAX_BYTES) { problems.push(`${file.name} is over 20 MB.`); continue; }
        const id = `uploaded-sticker-${++sequence.current}`;
        const url = URL.createObjectURL(file);
        urls.current.set(id, url);
        const result = await instance.add({
          id, label: file.name.replace(/\.[^.]+$/, ''), src: url,
          width: 144,
          at: placement(instance.list().length), rotation: -6.1,
          cut: stickerStyle.cut, finish: stickerStyle.finish, material: 'vinyl',
          look: { bands: 1.46, dispersion: .34, flake: 1.7 },
        });
        if (board.current !== instance) return;
        if (result) added++;
        else {
          URL.revokeObjectURL(url);
          urls.current.delete(id);
          problems.push(`${file.name} could not be read. Try PNG, WebP or JPG.`);
        }
      }
      setItems(instance.list().map(({ id }) => id));
      setStatus(added ? `${added} ${added === 1 ? 'sticker' : 'stickers'} added.` : '');
      setError(problems.join(' '));
    } catch (error) {
      if (board.current === instance) { setStatus(''); setError('Unable to add this image. Try PNG, WebP or JPG.'); }
      console.error('Could not add a sticker.', error);
    } finally {
      if (board.current === instance) setBusy(false);
    }
  }

  function removeStickers(all = false) {
    const instance = board.current;
    if (!instance) return;
    const id = items.at(-1);
    const removed = all ? instance.save().stickers : instance.save().stickers.filter(item => item.id === id || item.parent === id);
    for (const item of removed) {
      instance.remove(item.id);
      const url = urls.current.get(item.id);
      if (url) URL.revokeObjectURL(url);
      urls.current.delete(item.id);
    }
    if (all) extras.current.forEach(extra => extra.clear?.());
    setItems(instance.list().map(({ id: key }) => key));
    setError('');
    setStatus(all ? 'Stickers cleared.' : 'Last sticker removed.');
  }

  return (
    <>
      <div className="sticker-canvas-root" ref={canvasRoot} />
      <aside className="sticker-studio" aria-label="Decorate with stickers" data-stickers-ignore data-birds-ignore onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
        <GlassButton className="sticker-toggle" aria-expanded={open} aria-controls="sticker-panel" onClick={() => setOpen(value => !value)}>
          <Icon icon={Sticker} />Add stickers
        </GlassButton>
        {open && (
          <section className="sticker-panel" id="sticker-panel" aria-labelledby="sticker-panel-title" data-birds-pause>
            <div className="sticker-panel-heading"><h2 id="sticker-panel-title">Add stickers</h2><button className="sticker-close" aria-label="Close stickers panel" onClick={() => setOpen(false)}><Icon icon={X} size={16} /></button></div>
            <div className="sticker-style-options" role="group" aria-label="Style for new stickers">
              {STICKER_STYLES.map(style => (
                <button key={style.finish} type="button" className="sticker-style" aria-pressed={stickerStyle.finish === style.finish} disabled={busy} onClick={() => setStickerStyle(style)}>
                  <img src={style.preview} alt="" aria-hidden="true" />
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
            <input ref={picker} className="sr-only" type="file" accept="image/*" multiple tabIndex={-1} onChange={addImages} aria-label="Choose sticker images" />
            <div className="sticker-panel-actions">
              <GlassButton className="sticker-upload" onClick={() => picker.current.click()} disabled={!ready || busy || items.length >= MAX_STICKERS}><Icon icon={busy ? LoaderCircle : ImagePlus} className={busy ? 'icon-spin' : ''} />{busy ? 'Adding…' : 'Upload images'}</GlassButton>
              <button className="sticker-manage" aria-label="Remove last sticker" title="Remove last sticker" onClick={() => removeStickers()} disabled={!items.length || busy}><Icon icon={Undo2} size={16} /></button>
              <button className="sticker-manage" aria-label="Clear all stickers" title="Clear all stickers" onClick={() => removeStickers(true)} disabled={!items.length || busy}><Icon icon={Trash2} size={16} /></button>
            </div>
            {error && <p className="sticker-error" role="alert">{error}</p>}
          </section>
        )}
        <p className="sr-only" role="status">{status}</p>
      </aside>
    </>
  );
}
