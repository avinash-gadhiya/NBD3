import BowLogo from './BowLogo.jsx';
import GlassButton from './GlassButton.jsx';

export default function Header({ fullscreen, onToggleFullscreen }) {
  return (
    <header>
      <a className="brand" href="./" aria-label="Pokies home">
        <BowLogo />
        <span className="brand-copy">
          <span className="brand-wordmark">Pokies<span aria-hidden="true">.</span></span>
          <span className="brand-tagline">little things, kept forever</span>
        </span>
      </a>
      <div className="header-actions">
        <GlassButton className="fullscreen-button" aria-label={fullscreen ? 'Exit full screen' : 'Enter full screen'} title="Full screen" onClick={onToggleFullscreen}>⛶</GlassButton>
      </div>
    </header>
  );
}
