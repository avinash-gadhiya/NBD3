// A single cut-out figure that stands up from a page on a hinge along its base.
export default function PopUpFigure({ image, alt, className, figureRef }) {
  return (
    <div className={`cat-stand ${className}`} ref={figureRef}>
      <img src={image} alt={alt} />
    </div>
  );
}
