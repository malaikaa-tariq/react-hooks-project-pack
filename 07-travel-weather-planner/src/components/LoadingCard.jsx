export default function LoadingCard({ lines = 4 }) {
  return <div className="loading-card card" aria-label="Loading"><span className="skeleton skeleton-title" />{Array.from({ length: lines }, (_, index) => <span className="skeleton" key={index} />)}</div>
}
