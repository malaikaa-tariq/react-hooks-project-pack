export default function SectionHeader({ eyebrow, title, text, action }) {
  return <div className="section-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p>{text}</p>}</div>{action}</div>
}
