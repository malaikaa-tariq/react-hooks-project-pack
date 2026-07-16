import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/wellness-method', label: 'Method' },
];

function NavIcon({ name }) {
  const icons = {
    dashboard: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" fill="currentColor"/></svg>),
    usage: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h3V9H4zm6 0h3V4h-3zm6 0h3v-7h-3z" fill="currentColor"/></svg>),
    focus: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 5.3L20 11l-5.4 2.7L12 19l-2.6-5.3L4 11l5.4-2.7z" fill="currentColor"/></svg>),
    detox: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c3 4 5 6.6 5 10a5 5 0 1 1-10 0c0-3.4 2-6 5-10z" fill="currentColor"/></svg>),
    checkin: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.7-4.3-9.3-8.4C.5 9.2 2.5 5 6.7 5c2.2 0 4 1.2 5.3 2.9C13.3 6.2 15.1 5 17.3 5c4.2 0 6.2 4.2 4 7.6C18.7 16.7 12 21 12 21z" fill="currentColor"/></svg>),
    health: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4h4v4h4v4h-4v4h-4v-4H6V8h4z" fill="currentColor"/></svg>),
    analytics: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9h3v10zm5 0V5h3v14zm5 0v-7h3v7z" fill="currentColor"/></svg>),
    settings: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.4 13a7.8 7.8 0 0 0 .1-2l2-1.6-2-3.5-2.5 1a8.3 8.3 0 0 0-1.7-1l-.4-2.7H9l-.4 2.7c-.6.2-1.2.6-1.7 1l-2.5-1-2 3.5 2 1.6a7.8 7.8 0 0 0 .1 2l-2 1.6 2 3.5 2.5-1c.5.4 1.1.8 1.7 1l.4 2.7h4.1l.4-2.7c.6-.2 1.2-.6 1.7-1l2.5 1 2-3.5zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z" fill="currentColor"/></svg>),
  };
  return <span className="nav-glyph">{icons[name]}</span>;
}

const privateLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/usage', label: 'Usage', icon: 'usage' },
  { to: '/focus', label: 'Focus', icon: 'focus' },
  { to: '/detox', label: 'Detox', icon: 'detox' },
  { to: '/check-in', label: 'Health Check-In', icon: 'checkin' },
  { to: '/health-guide', label: 'Health Guide', icon: 'health' },
  { to: '/analytics', label: 'Analytics', icon: 'analytics' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

function Brand({ to = '/' }) {
  return (
    <NavLink className="brand" to={to} aria-label="DigiBalance home">
      <img src="/digibalance-mark.svg" alt="" />
      <span><strong>Digi</strong>Balance</span>
    </NavLink>
  );
}

export default function Navbar() {
  const { currentUser, logout } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  if (!currentUser) {
    return (
      <header className="public-nav-wrap">
        <nav className="public-nav shell" aria-label="Main navigation">
          <Brand />
          <button className="icon-button nav-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Open menu" aria-expanded={open}>☰</button>
          <div className={`public-nav-links ${open ? 'is-open' : ''}`}>
            {publicLinks.map((link) => <NavLink key={link.to} to={link.to} onClick={close} className={({ isActive }) => isActive ? 'active' : ''}>{link.label}</NavLink>)}
            <NavLink to="/login" onClick={close}>Login</NavLink>
            <NavLink className="button button-small" to="/signup" onClick={close}>Sign up</NavLink>
            <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'light' ? '☾' : '☀'}</button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      <button className="private-mobile-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Open private navigation">☰</button>
      {open && <button className="sidebar-scrim" type="button" onClick={close} aria-label="Close navigation" />}
      <aside className={`private-sidebar simplified-sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <Brand to="/dashboard" />
          <button className="icon-button sidebar-close" type="button" onClick={close} aria-label="Close navigation">×</button>
        </div>
        <div className="sidebar-profile">
          <div className="avatar">{currentUser.fullName?.charAt(0).toUpperCase()}</div>
          <div><strong>{currentUser.fullName}</strong><span>Your wellness space</span></div>
        </div>
        <nav className="private-nav compact-private-nav" aria-label="Wellness navigation">
          {privateLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={close} className={({ isActive }) => isActive ? 'active' : ''}>
              <NavIcon name={link.icon} />{link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-actions">
          <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'light' ? '☾' : '☀'}</button>
          <button className="button button-ghost" type="button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
    </>
  );
}
