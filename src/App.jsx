import Header from './components/Header.jsx';
import PixelCat from './components/PixelCat.jsx';
import CoffeeKitty from './components/CoffeeKitty.jsx';
import GlassButton from './components/GlassButton.jsx';
import ViewerToolbar from './components/viewer/ViewerToolbar.jsx';
import BookControls from './components/viewer/BookControls.jsx';
import Book from './components/book/Book.jsx';
import StickerStudio from './components/StickerStudio.jsx';
import { useBookExperience } from './hooks/useBookExperience.js';
import { useCardContent } from './hooks/useCardContent.js';

const VIEWER_LABEL = 'Interactive birthday book. Click the cover to open. Click the right page to go forward or the left page to go back. Use Close your card to close. Drag to rotate; scroll to zoom; Shift-drag to move. PageDown and PageUp turn pages.';

export default function App() {
  const { refs, ui, actions } = useBookExperience();
  const content = useCardContent();

  return (
    <>
      <Header fullscreen={ui.fullscreen} onToggleFullscreen={actions.toggleFullscreen} />
      <main>
        <div className="viewer-wrap">
          <ViewerToolbar
            view={ui.view}
            onFrontView={() => actions.setView('front')}
            onTopView={() => actions.setView('top')}
            onReset={actions.reset}
          />
          <div className="experience" ref={refs.viewer} tabIndex={0} aria-label={VIEWER_LABEL}>
            <div className="desk-shadow" ref={refs.deskShadow}></div>
            <Book refs={refs} content={content} />
            <div className="open-cue" hidden={ui.cueHidden}>Click the book to open <span>↗</span></div>
          </div>
          <BookControls opened={ui.opened} page={ui.page} onToggle={actions.toggleBook} onTurnPage={actions.turnPage} />
          <PixelCat />
          <CoffeeKitty />
          <GlassButton className="flight-replay" hidden={!ui.replayVisible} aria-label="Fly the paper butterflies again" onClick={actions.replayButterflies}>✧ Paper butterflies</GlassButton>
        </div>
      </main>
      <StickerStudio onPointerClaimed={actions.cancelPointer} />
      <div className="butterfly-sky" ref={refs.sky} aria-hidden="true"></div>
      <div className="sr-only" role="status" aria-live="polite">{ui.flightStatus}</div>
    </>
  );
}
