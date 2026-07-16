import { useApp } from '../context/AppContext';

const messages = [
  'Use technology better, not longer',
  'Rest your eyes between screen blocks',
  'Protect sleep with a calmer stopping time',
  'Small breaks support stronger focus',
  'Move, hydrate, breathe, then continue',
];

function HeadlineGroup({ hidden = false }) {
  return (
    <div className="moving-headline-group" aria-hidden={hidden || undefined}>
      {messages.map((message) => (
        <span key={message}>
          <i aria-hidden="true" />
          {message}
        </span>
      ))}
    </div>
  );
}

export default function MovingHeadline() {
  const { currentUser } = useApp();

  return (
    <div className={`moving-headline ${currentUser ? 'private-moving-headline' : 'public-moving-headline'}`} aria-label="Digital wellness reminders">
      <div className="moving-headline-track">
        <HeadlineGroup />
        <HeadlineGroup hidden />
      </div>
    </div>
  );
}
