// A portrait printed across two rigid panels that share one crease at the spine.
export default function PortraitStand({ image, label, standRef, leftRef, rightRef }) {
  return (
    <div className="stand" ref={standRef} role="img" aria-label={label}>
      <div className="portrait-half half-left" ref={leftRef}><img src={image} className="portrait-print" alt="" aria-hidden="true" /></div>
      <div className="portrait-half half-right" ref={rightRef}><img src={image} className="portrait-print" alt="" aria-hidden="true" /></div>
    </div>
  );
}
