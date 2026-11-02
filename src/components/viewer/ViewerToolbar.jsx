import GlassButton from '../GlassButton.jsx';

export default function ViewerToolbar({ view, onFrontView, onTopView }) {
  return (
    <div className="viewer-toolbar">
      <div className="camera-presets" role="group" aria-label="Camera views">
        <GlassButton className={view === 'front' ? 'selected' : undefined} aria-pressed={view === 'front'} onClick={onFrontView}>Perspective</GlassButton>
        <GlassButton className={view === 'top' ? 'selected' : undefined} aria-pressed={view === 'top'} onClick={onTopView}>Top view</GlassButton>
      </div>
    </div>
  );
}
