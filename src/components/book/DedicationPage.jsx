import PageSticker from './PageSticker.jsx';

// Page 2, left side: the back of the turning leaf.
export default function DedicationPage({ content }) {
  const [title1, title2] = content.dedicationTitle;
  const [line1, line2] = content.dedicationLines;
  return (
    <div className="leaf-back paper">
      <PageSticker name="teddy" left={265} top={318} width={62} angle={-9} />
      <PageSticker name="omg" left={265} top={392} width={54} angle={7} />
      <div className="inside-frame">
        <span className="tiny-label">{content.dedicationLabel}</span>
        <h2>{title1}<br /><em>{title2}</em></h2>
        <div className="sun">✿</div>
        <p>{line1}<br />{line2}</p>
        <div className="love">{content.dedicationSignature}</div>
        <span className="corner-flower">✳</span>
      </div>
    </div>
  );
}
