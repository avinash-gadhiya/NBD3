import BowLogo from './BowLogo.jsx';
import GlassButton from './GlassButton.jsx';
import { Maximize, Minimize } from 'lucide-react';
import Icon from './Icon.jsx';

export default function Header({ fullscreen, onToggleFullscreen }) {
  return (
    <header>
      <a className="brand" href="./" aria-label="Pokies home">
        <BowLogo />
        <span className="brand-copy">
          <span className="brand-wordmark">Pokies<span aria-hidden="true">.</span></span>
        </span>
      </a>
      <div className="header-actions">
        <GlassButton className="fullscreen-button" aria-label={fullscreen ? 'Exit full screen' : 'Enter full screen'} title={fullscreen ? 'Exit full screen' : 'Full screen'} onClick={onToggleFullscreen}><Icon icon={fullscreen ? Minimize : Maximize} size={20} /></GlassButton>
      </div>
    </header>
  );
}
