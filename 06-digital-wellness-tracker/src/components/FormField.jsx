export default function FormField({ label, error, hint, children, className = '' }) {
  return (
    <label className={`form-field ${className}`}>
      <span>{label}</span>
      {children}
      {hint && !error && <small>{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
