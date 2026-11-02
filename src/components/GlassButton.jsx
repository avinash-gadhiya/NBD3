export default function GlassButton({ children, ...props }) {
  return (
    <button {...props}>
      <span className="glass-button-content">{children}</span>
      <span className="circle-overlay" aria-hidden="true" />
    </button>
  );
}
