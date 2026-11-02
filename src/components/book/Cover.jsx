import pinkBow from '../../assets/images/pink-bow.png';
import catDuo from '../../assets/stickers/frog-shark-cats.png';
import PageSticker from './PageSticker.jsx';

export default function Cover({ coverRef, content }) {
  const [wish1, wish2] = content.wishLines;
  return (
    <div className="cover" ref={coverRef}>
      <div className="front paper">
        <div className="border">
          <img className="cover-bow" src={pinkBow} alt="" aria-hidden="true" />
          <h1 className="cover-title"><span>{content.coverTitle[0]}</span><em>{content.coverTitle[1]}</em></h1>
          <div className="ribbon">For {content.recipientName}</div>
          <img className="cover-cat-sticker" src={catDuo} alt="Two playful cats wearing frog and shark hats" draggable="false" />
        </div>
      </div>
      <div className="back paper">
        <PageSticker name="roses" left={269} top={308} width={58} angle={12} />
        <div className="inside-frame">
          <span className="tiny-label">{content.wishLabel}</span>
          <h2>Happy Birthday,<br /><em>{content.recipientName.split(' ')[0]}.</em></h2>
          <div className="sun">✺</div>
          <p>{wish1}<br />{wish2}</p>
          <div className="love">{content.signature}</div>
          <span className="corner-flower">✿</span>
        </div>
      </div>
    </div>
  );
}
