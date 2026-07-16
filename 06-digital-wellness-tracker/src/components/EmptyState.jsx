export default function EmptyState({ title = 'Nothing here yet', text = 'Add your first item to begin.', icon = '◌', action }) {
  return (
    <div className="empty-state">
      <span aria-hidden="true">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
