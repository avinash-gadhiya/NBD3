// Labels belong to the surrounding button/link; these SVGs are decorative.
export default function Icon({ icon: Glyph, size = 14, className = '', ...props }) {
  return <Glyph size={size} strokeWidth={1.8} aria-hidden="true" focusable="false" className={`ui-icon ${className}`.trim()} {...props} />;
}
