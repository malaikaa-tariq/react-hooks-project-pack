import { createElement } from 'react'
import { CloudSun } from 'lucide-react'
export default function EmptyState({ icon = CloudSun, title, message, action }) {
  return <div className="empty-state"><span className="empty-icon">{createElement(icon)}</span><h3>{title}</h3><p>{message}</p>{action}</div>
}
