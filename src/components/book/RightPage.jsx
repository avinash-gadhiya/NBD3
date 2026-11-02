import recipientPhoto from '../../assets/images/nishtha-photo.png';
import PageSticker from './PageSticker.jsx';

// Page 1: the front of the turning leaf.
export default function RightPage({ content }) {
  const [line1, line2] = content.pageHeadline;
  const [message1, message2] = content.pageMessage;
  return (
    <div className="right-page paper leaf-front page-one">
      <div className="wall"></div>
      <PageSticker name="camera" left={164} top={144} width={65} angle={-10} />
      <PageSticker name="spidey-kitty" left={12} top={326} width={72} angle={-5} />
      <div className="picture">
        <img src={recipientPhoto} alt="Nistha wearing glasses and a blue patterned top" width="899" height="1599" />
      </div>
      <div className="inside-top">{line1}<br />{line2} <em>{content.pageHeadlineEmphasis}</em></div>
      <div className="inside-bottom">{message1}<br />{message2}</div>
      <div className="page-imprint">{content.wishLabel}</div>
    </div>
  );
}
