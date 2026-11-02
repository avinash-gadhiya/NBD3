import coffeeAnimation from '../assets/images/hello-kitty-coffee.gif';
import coffeeStill from '../assets/images/hello-kitty-coffee-still.png';

export default function CoffeeKitty() {
  return (
    <div className="coffee-kitty-companion" aria-hidden="true">
      <picture>
        <source media="(prefers-reduced-motion: reduce)" srcSet={coffeeStill} />
        <img src={coffeeAnimation} alt="" width="443" height="448" decoding="async" draggable="false" />
      </picture>
    </div>
  );
}
