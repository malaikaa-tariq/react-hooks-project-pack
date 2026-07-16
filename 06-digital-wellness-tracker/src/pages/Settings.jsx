import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { profile, clearWellnessData, logout, showToast } = useApp();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const clear = () => {
    if (window.confirm('Clear all tracker records while keeping your account and profile?')) clearWellnessData();
  };

  const restartGuide = () => {
    window.dispatchEvent(new Event('digibalance:start-guide'));
    showToast('guidance', 'The guided introduction is ready.');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <main className="private-page settings-page">
      <div className="private-shell narrow-private-shell">
        <header className="settings-heading">
          <span className="eyebrow">Simple controls</span>
          <h1>Settings</h1>
          <p>Manage the few choices that affect your DigiBalance experience.</p>
        </header>

        <section className="settings-list">
          <article>
            <div className="settings-icon">◉</div>
            <div><h2>Profile and goals</h2><p>{profile.wellnessGoal || 'Choose your main wellness goal'} · {profile.screenGoal || 6}h screen target · {profile.sleepTarget || 8}h sleep target</p></div>
            <button className="button button-secondary" type="button" onClick={() => navigate('/profile-setup')}>Edit profile</button>
          </article>

          <article>
            <div className="settings-icon">{theme === 'light' ? '☾' : '☀'}</div>
            <div><h2>Appearance</h2><p>Switch the interface while keeping the logo and calm steel-blue palette unchanged.</p></div>
            <button className="icon-button settings-theme-button" type="button" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'light' ? '☾' : '☀'}</button>
          </article>

          <article>
            <div className="settings-icon">→</div>
            <div><h2>Guided introduction</h2><p>Restart the popup guide whenever you want a reminder of the main screens.</p></div>
            <button className="button button-secondary" type="button" onClick={restartGuide}>Show guide</button>
          </article>



          <article className="settings-danger-row">
            <div className="settings-icon">△</div>
            <div><h2>Clear tracker records</h2><p>Remove usage, focus, reset, and check-in records while keeping your account and profile.</p></div>
            <button className="button button-danger" type="button" onClick={clear}>Clear data</button>
          </article>

          <article>
            <div className="settings-icon">↪</div>
            <div><h2>Account session</h2><p>Log out safely. Your locally saved account remains available on this browser.</p></div>
            <button className="button button-ghost" type="button" onClick={handleLogout}>Logout</button>
          </article>
        </section>

        <div className="settings-privacy-note"><span>◌</span><p>Your personal tracker data stays in this browser. Public services provide only general advice, weather context, and public-health awareness.</p></div>
      </div>
    </main>
  );
}
