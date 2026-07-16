import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Modal from './Modal';
import { useApp } from '../context/AppContext';

const pageSteps = {
  '/dashboard': [
    { selector: '.clean-score-card', title: 'Your wellness score', text: 'Start here to understand your current digital balance.', benefit: 'It combines your recent usage, focus, sleep, breaks, and check-ins.' },
    { selector: '.clean-next-card', title: 'Your next step', text: 'Use this card when you are unsure what to do next.', benefit: 'It turns your records into one manageable action.' },
    { selector: '.health-support-card .button', title: 'Open the Health Guide', text: 'Use this button for WHO-inspired health-awareness guidance.', benefit: 'You receive safer suggestions connected to your routine.' },
  ],
  '/usage': [
    { selector: '.usage-switch', title: 'Choose what to record', text: 'Switch between total screen time and important app usage.', benefit: 'You only track the information that affects your day.' },
    { selector: '.usage-form-panel .button[type="submit"]', title: 'Save your snapshot', text: 'Complete the short form and use this button to save it.', benefit: 'A few saved days reveal your real pattern.' },
    { selector: '.usage-history-panel', title: 'Review recent records', text: 'Your latest entries and limits appear here.', benefit: 'You can edit habits without repeating every detail.' },
  ],
  '/focus': [
    { selector: '.mode-selector', title: 'Choose a focus length', text: 'Pick the timer that matches the task in front of you.', benefit: 'A realistic session is easier to finish.' },
    { selector: '.timer-controls .button:first-child', title: 'Start the timer', text: 'Press Start after closing unrelated tabs and notifications.', benefit: 'One clear boundary protects your attention.' },
    { selector: '.timer-controls .button-success', title: 'Save the completed session', text: 'Use this after finishing your focus block.', benefit: 'Saved sessions appear in your progress and analytics.' },
  ],
  '/detox': [
    { selector: '.detox-preset-row', title: 'Choose a ready-made reset', text: 'Select a preset or create your own small digital boundary.', benefit: 'Specific limits are easier to follow than extreme restrictions.' },
    { selector: '.detox-form-panel .button[type="submit"]', title: 'Create the reset', text: 'Save the plan after choosing the app, duration, and reason.', benefit: 'Your plan stays visible until you finish or pause it.' },
    { selector: '.detox-plan-panel', title: 'Continue your current plan', text: 'Mark days complete, pause, resume, or remove the plan here.', benefit: 'Progress stays flexible when real life changes.' },
  ],
  '/check-in': [
    { selector: '.mood-selector', title: 'Choose how the day feels', text: 'Select the mood that best matches this moment.', benefit: 'Mood helps connect digital habits to emotional wellbeing.' },
    { selector: '.checkin-form-panel .button[type="submit"]', title: 'Save the daily check-in', text: 'Record mood, energy, stress, sleep, and breaks together.', benefit: 'One form gives a clearer health picture without extra pages.' },
    { selector: '.checkin-history', title: 'Open an earlier check-in', text: 'Select a saved record to load it back into the form.', benefit: 'You can review or update a day quickly.' },
  ],
  '/health-guide': [
    { selector: '.health-form-panel .button[type="submit"]', title: 'Save health context', text: 'Add only the few details that help shape general guidance.', benefit: 'The app can make suggestions more relevant without a long form.' },
    { selector: '.health-guide-panel', title: 'Read your suggested routine', text: 'This area explains safe habit-level next steps.', benefit: 'It supports reflection without diagnosing or prescribing medicine.' },
    { selector: '.doctor-support-card', title: 'Know when doctor support matters', text: 'Read this note when a health concern or abnormal reading keeps returning.', benefit: 'It helps you separate general habit guidance from situations that need professional care.' },
  ],
  '/analytics': [
    { selector: '.analytics-focus-grid', title: 'Compare screen habits', text: 'Review screen-time direction and helpful versus distracting use.', benefit: 'Patterns are easier to understand after several saved records.' },
    { selector: '.analytics-story-grid', title: 'Review recovery', text: 'Sleep, breaks, mood, and your strongest habit appear here.', benefit: 'You can protect what is already working.' },
    { selector: '.global-awareness-panel', title: 'Read public-health context', text: 'This section translates WHO public-health awareness into simple guidance.', benefit: 'It adds context without presenting a medical diagnosis.' },
  ],
  '/settings': [
    { selector: '.settings-list article:nth-child(1) .button', title: 'Edit your profile', text: 'Update your goals and health context whenever they change.', benefit: 'Recommendations stay connected to your current routine.' },
    { selector: '.settings-list article:nth-child(2) .settings-theme-button', title: 'Change the appearance', text: 'Use this icon to switch between light and dark themes.', benefit: 'The interface stays comfortable in different lighting.' },
    { selector: '.settings-list article:nth-child(3) .button', title: 'Restart this guide', text: 'Use Show guide whenever you want these instructions again.', benefit: 'You can learn the app at your own pace.' },
  ],
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function GuidedWalkthrough() {
  const { currentUserId, profile } = useApp();
  const location = useLocation();
  const storageKey = useMemo(() => currentUserId ? `digibalance.guide.${currentUserId}` : '', [currentUserId]);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [position, setPosition] = useState(null);
  const steps = useMemo(() => pageSteps[location.pathname] || [], [location.pathname]);

  useEffect(() => {
    if (!currentUserId || !profile?.completed) {
      setChoiceOpen(false);
      setActive(false);
      return;
    }
    const preference = localStorage.getItem(storageKey);
    if (!preference) setChoiceOpen(true);
  }, [currentUserId, profile?.completed, storageKey]);

  useEffect(() => {
    const restart = () => {
      if (!storageKey) return;
      localStorage.setItem(storageKey, 'active');
      Object.keys(pageSteps).forEach((route) => localStorage.removeItem(`${storageKey}.seen.${route}`));
      setChoiceOpen(false);
      setStepIndex(0);
      setActive(true);
    };
    window.addEventListener('digibalance:start-guide', restart);
    return () => window.removeEventListener('digibalance:start-guide', restart);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !steps.length) {
      setActive(false);
      return undefined;
    }
    const preference = localStorage.getItem(storageKey);
    const pageSeen = localStorage.getItem(`${storageKey}.seen.${location.pathname}`);
    if (preference === 'active' && !pageSeen) {
      setStepIndex(0);
      const timer = window.setTimeout(() => setActive(true), 450);
      return () => window.clearTimeout(timer);
    }
    setActive(false);
    return undefined;
  }, [location.pathname, steps.length, storageKey]);

  useEffect(() => {
    document.querySelectorAll('.page-guide-target').forEach((element) => element.classList.remove('page-guide-target'));
    if (!active || !steps[stepIndex]) {
      setPosition(null);
      return undefined;
    }

    let attempts = 0;
    const locate = () => {
      const target = document.querySelector(steps[stepIndex].selector);
      if (!target && attempts < 12) {
        attempts += 1;
        window.setTimeout(locate, 120);
        return;
      }
      if (!target) {
        setPosition({ top: 100, left: 20, placement: 'below', tail: 40 });
        return;
      }
      target.classList.add('page-guide-target');
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      window.setTimeout(() => {
        const rect = target.getBoundingClientRect();
        const width = Math.min(360, window.innerWidth - 24);
        const estimatedHeight = 230;
        const placement = rect.bottom + estimatedHeight + 24 <= window.innerHeight ? 'below' : 'above';
        const top = placement === 'below' ? rect.bottom + 16 : Math.max(12, rect.top - estimatedHeight - 16);
        const left = clamp(rect.left + rect.width / 2 - width / 2, 12, window.innerWidth - width - 12);
        const tail = clamp(rect.left + rect.width / 2 - left, 28, width - 28);
        setPosition({ top, left, width, placement, tail });
      }, 260);
    };
    locate();

    const refresh = () => setStepIndex((value) => value);
    window.addEventListener('resize', refresh);
    return () => {
      window.removeEventListener('resize', refresh);
      document.querySelectorAll('.page-guide-target').forEach((element) => element.classList.remove('page-guide-target'));
    };
  }, [active, stepIndex, steps]);

  if (!currentUserId || !profile?.completed) return null;

  const chooseGuide = () => {
    localStorage.setItem(storageKey, 'active');
    setChoiceOpen(false);
    setStepIndex(0);
    setActive(Boolean(steps.length));
  };
  const chooseSkip = () => {
    localStorage.setItem(storageKey, 'disabled');
    setChoiceOpen(false);
    setActive(false);
  };
  const closePageGuide = () => {
    localStorage.setItem(`${storageKey}.seen.${location.pathname}`, 'true');
    setActive(false);
  };
  const next = () => {
    if (stepIndex >= steps.length - 1) {
      closePageGuide();
      return;
    }
    setStepIndex((value) => value + 1);
  };

  return (
    <>
      <Modal open={choiceOpen} title="Welcome to DigiBalance" onClose={chooseSkip} size="small">
        <div className="guide-choice">
          <img src="/assets/dashboard-day.svg" alt="A calm daily wellness overview" />
          <span className="guide-choice-kicker">Are you familiar with this app?</span>
          <h3>Choose how you want to begin.</h3>
          <p>New users can receive one speech-bubble instruction at a time when opening each page.</p>
          <div className="guide-choice-actions">
            <button className="button" type="button" onClick={chooseGuide}>I’m new, guide me</button>
            <button className="button button-ghost" type="button" onClick={chooseSkip}>I already know</button>
          </div>
        </div>
      </Modal>

      {active && position && steps[stepIndex] && (
        <aside
          className={`page-guide-bubble guide-${position.placement}`}
          style={{ top: position.top, left: position.left, width: position.width, '--guide-tail': `${position.tail}px` }}
          role="dialog"
          aria-live="polite"
        >
          <small>{stepIndex + 1} of {steps.length}</small>
          <h3>{steps[stepIndex].title}</h3>
          <p>{steps[stepIndex].text}</p>
          <strong>{steps[stepIndex].benefit}</strong>
          <div className="page-guide-actions">
            <button type="button" className="button button-ghost button-small" onClick={closePageGuide}>Close</button>
            <button type="button" className="button button-small" onClick={next}>{stepIndex === steps.length - 1 ? 'Done' : 'Next'}</button>
          </div>
        </aside>
      )}
    </>
  );
}
