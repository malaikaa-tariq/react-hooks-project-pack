import { useMemo, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import Modal from './Modal'
import EmptyState from './EmptyState'

export default function ViewAllModal({ open, onClose, title, items, getSearchText, renderItem, onDelete, onDeleteSelected }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState([])
  const filtered = useMemo(() => items.filter((item) => getSearchText(item).toLowerCase().includes(query.toLowerCase())), [getSearchText, items, query])
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((item) => item.id))
  const removeSelected = () => {
    if (!selected.length || !window.confirm(`Delete ${selected.length} selected items?`)) return
    onDeleteSelected(selected); setSelected([])
  }
  return <Modal open={open} onClose={onClose} title={title} wide><div className="modal-tools"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search saved items" /></label><button className="button button-soft button-small" onClick={toggleAll}>{selected.length === filtered.length && filtered.length ? 'Clear selection' : 'Select all'}</button><button className="button button-danger button-small" onClick={removeSelected} disabled={!selected.length}><Trash2 size={15} /> Delete selected</button></div>{filtered.length ? <div className="modal-list">{filtered.map((item) => <div className="modal-list-row" key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} aria-label="Select item" /><div className="modal-list-content">{renderItem(item)}</div><button className="icon-button danger-icon" onClick={() => { if (window.confirm('Delete this item?')) onDelete(item.id) }} aria-label="Delete item"><Trash2 size={17} /></button></div>)}</div> : <EmptyState title="Nothing found" message="Try a different search." />}</Modal>
}
