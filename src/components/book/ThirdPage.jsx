import PageSticker from './PageSticker.jsx';
import catStickers from '../../assets/stickers/meow-cat-group.png';

// The final spread, revealed when the second leaf turns.
export default function ThirdPage({ content, pageRef }) {
  const [line1, line2] = content.pageThreeHeadline;
  const [message1, message2] = content.pageThreeMessage;
  return (
    <div className="right-page paper page-three" ref={pageRef}>
      <div className="wall"></div>
      <PageSticker name="saturn" left={24} top={325} width={58} angle={8} />
      <div className="inside-top">{line1}<br />{line2} <em>{content.pageThreeHeadlineEmphasis}</em></div>
      <img className="page-three-cat-stickers" src={catStickers} alt="Pink Meow lettering and a playful cat with hearts" draggable="false" />
      <div className="inside-bottom">{message1}<br />{message2}</div>
      <div className="page-imprint">{content.motivationLabel}</div>
    </div>
  );
}
