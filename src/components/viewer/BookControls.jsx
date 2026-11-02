import GlassButton from '../GlassButton.jsx';

export default function BookControls({ opened, page, onToggle, onTurnPage }) {
  return (
    <div className="book-controls">
      <GlassButton className="open-button" aria-expanded={opened} onClick={onToggle}>
        <span>{opened ? 'Close your card' : 'Open your card'}</span>
        <span className="btn-icon" aria-hidden="true">{opened ? '↙' : '↗'}</span>
      </GlassButton>
      {opened && (
        <nav className="page-navigation" aria-label="Birthday card pages">
          <GlassButton className="page-button" aria-label="Previous page" disabled={page === 1} onClick={() => onTurnPage(-1)}>←</GlassButton>
          <span className="page-count" aria-live="polite" aria-atomic="true"><span className="sr-only">Page </span>{page} / 3</span>
          <GlassButton className="page-button" aria-label="Next page" disabled={page === 3} onClick={() => onTurnPage(1)}>Next →</GlassButton>
        </nav>
      )}
    </div>
  );
}
