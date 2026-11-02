import PageSticker from './PageSticker.jsx';

// Page 2, right side: lies under page 1 until the leaf is turned.
export default function SecondPage({ content, pageRef }) {
  const [line1, line2] = content.pageTwoHeadline;
  const [message1, message2] = content.pageTwoMessage;
  return (
    <div className="right-page paper page-two leaf-front" ref={pageRef}>
      <div className="wall"></div>
      <PageSticker name="glasses" left={26} top={342} width={72} angle={-10} />
      <PageSticker name="diet-coke-quote" left={140} top={131} width={110} angle={-5} />
      <div className="inside-top">{line1}<br />{line2} <em>{content.pageTwoHeadlineEmphasis}</em></div>
      <div className="inside-bottom">{message1}<br />{message2}</div>
      <div className="page-imprint">{content.dedicationLabel}</div>
    </div>
  );
}
