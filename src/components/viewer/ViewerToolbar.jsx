import GlassButton from '../GlassButton.jsx';
import { RotateCcw } from 'lucide-react';
import Icon from '../Icon.jsx';

export default function ViewerToolbar({ view, onFrontView, onTopView, onReset }) {
  return (
    <div className="viewer-toolbar">
      <div className="camera-presets" role="group" aria-label="Camera views">
        <GlassButton className={view === 'front' ? 'selected' : undefined} aria-pressed={view === 'front'} onClick={onFrontView}>Perspective</GlassButton>
        <GlassButton className={view === 'top' ? 'selected' : undefined} aria-pressed={view === 'top'} onClick={onTopView}>Top view</GlassButton>
        <GlassButton title="Reset zoom and position" onClick={onReset}><Icon icon={RotateCcw} size={12} />Reset</GlassButton>
      </div>
    </div>
  );
}
