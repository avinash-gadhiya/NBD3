import cakeAnimation from '../../assets/images/pixel-birthday-cake.gif';
import cakeStill from '../../assets/images/pixel-birthday-cake-still.png';

// Both folding panels show matching halves of the original animated cake.
export default function CakeArt() {
  return (
    <picture className="paper-cake-art" aria-hidden="true">
      <source media="(prefers-reduced-motion: reduce)" srcSet={cakeStill} />
      <img className="paper-cake-print" src={cakeAnimation} alt="" width="500" height="450" draggable="false" />
    </picture>
  );
}
