import dimensions from '../../assets/stickers/manifest.json';
import roses from '../../assets/stickers/roses.png';
import rosesMask from '../../assets/stickers/roses-mask.svg';
import teddy from '../../assets/stickers/teddy.png';
import teddyMask from '../../assets/stickers/teddy-mask.svg';
import guitar from '../../assets/stickers/guitar.png';
import guitarMask from '../../assets/stickers/guitar-mask.svg';
import camera from '../../assets/stickers/camera.png';
import cameraMask from '../../assets/stickers/camera-mask.svg';
import glasses from '../../assets/stickers/glasses.png';
import glassesMask from '../../assets/stickers/glasses-mask.svg';
import saturn from '../../assets/stickers/saturn.png';
import saturnMask from '../../assets/stickers/saturn-mask.svg';
import spideyKitty from '../../assets/stickers/spidey-kitty.png';
import spideyKittyMask from '../../assets/stickers/spidey-kitty-mask.svg';
import omg from '../../assets/stickers/omg.png';
import omgMask from '../../assets/stickers/omg-mask.svg';
import cola from '../../assets/stickers/cola.png';
import colaMask from '../../assets/stickers/cola-mask.svg';
import dietCokeQuote from '../../assets/stickers/diet-coke-quote.png';
import dietCokeQuoteMask from '../../assets/stickers/diet-coke-quote-mask.svg';

const artwork = {
  roses: { image: roses, mask: rosesMask },
  teddy: { image: teddy, mask: teddyMask },
  guitar: { image: guitar, mask: guitarMask },
  camera: { image: camera, mask: cameraMask },
  glasses: { image: glasses, mask: glassesMask },
  saturn: { image: saturn, mask: saturnMask },
  'spidey-kitty': { image: spideyKitty, mask: spideyKittyMask },
  omg: { image: omg, mask: omgMask },
  cola: { image: cola, mask: colaMask },
  'diet-coke-quote': { image: dietCokeQuote, mask: dietCokeQuoteMask, imageRendering: 'auto' },
};

// Fixed scrapbook placements stay with their paper as the book turns.
export default function PageSticker({ name, left, top, width, angle = 0 }) {
  const { image, mask } = artwork[name];
  const source = dimensions[name];
  const { crop } = source;
  return (
    <span className="page-sticker" data-sticker={name} aria-hidden="true" style={{
      left, top, width, height: width * crop.height / crop.width,
      transform: `rotate(${angle}deg)`,
    }}>
      <span className="page-sticker-crop">
        <img src={image} alt="" width={source.width} height={source.height} draggable="false" style={{
          width: `${source.width / crop.width * 100}%`,
          left: `${-crop.x / crop.width * 100}%`,
          top: `${-crop.y / crop.height * 100}%`,
          maskImage: `url("${mask}")`, WebkitMaskImage: `url("${mask}")`,
          imageRendering: artwork[name].imageRendering,
        }} />
      </span>
    </span>
  );
}
