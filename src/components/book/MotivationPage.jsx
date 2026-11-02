import PageSticker from './PageSticker.jsx';
import PageMotif from './PageMotif.jsx';

// The reverse of the second leaf becomes the left side of page 3.
export default function MotivationPage({ content }) {
  const [title1, title2] = content.motivationTitle;
  const [line1, line2] = content.motivationLines;
  return (
    <div className="leaf-back paper motivation-page">
      <PageSticker name="guitar" left={263} top={309} width={67} angle={-12} />
      <PageSticker name="cola" left={285} top={381} width={24} angle={9} />
      <div className="inside-frame">
        <span className="tiny-label">{content.motivationLabel}</span>
        <h2>{title1}<br /><em>{title2}</em></h2>
        <PageMotif kind="swan" />
        <p>{line1}<br />{line2}</p>
        <div className="love">{content.motivationSignature}</div>
        <span className="corner-flower" aria-hidden="true">✳</span>
      </div>
    </div>
  );
}
