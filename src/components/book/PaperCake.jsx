import CakeArt from './CakeArt.jsx';

export default function PaperCake({ cakeRef, leftRef, rightRef }) {
  return (
    <div className="cake paper-cake" ref={cakeRef} role="img" aria-label="A folding pink pixel birthday cake with three flickering candles">
      <div className="cake-half cake-half-left" ref={leftRef}><CakeArt /></div>
      <div className="cake-half cake-half-right" ref={rightRef}><CakeArt /></div>
    </div>
  );
}
