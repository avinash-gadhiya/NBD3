import catAnimation from '../assets/images/pixel-cat-joojaebum.gif';
import catStill from '../assets/images/pixel-cat-joojaebum-still.png';

// Decorative companion; lets all pointer gestures reach the book underneath.
export default function PixelCat() {
  return (
    <div className="pixel-cat-companion" aria-hidden="true">
      <picture>
        <source media="(prefers-reduced-motion: reduce)" srcSet={catStill} />
        <img src={catAnimation} alt="" width="480" height="480" decoding="async" draggable="false" />
      </picture>
    </div>
  );
}
