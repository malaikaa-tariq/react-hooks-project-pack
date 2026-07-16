import { createElement, useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AirVent, CalendarDays, ChevronDown, CloudSun, Columns3, Home, LogIn, LogOut, Menu, Moon, Search, Settings, Sparkles, Sun, UserRoundPlus, X, Bookmark, Activity } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search Weather' },
  { to: '/compare', label: 'Compare Cities' },
]

const privateGroups = [
  { label: 'Overview', links: [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/search', label: 'Search Weather', icon: Search },
    { to: '/saved-cities', label: 'Saved Cities', icon: Bookmark },
  ] },
  { label: 'Forecast', links: [
    { to: '/hourly', label: 'Hourly Forecast', icon: CloudSun },
    { to: '/weekly', label: 'Weekly Forecast', icon: CalendarDays },
    { to: '/air-quality', label: 'Air Quality', icon: AirVent },
  ] },
  { label: 'Plan', links: [
    { to: '/activity-planner', label: 'Activity Planner', icon: Activity },
    { to: '/compare', label: 'Compare Cities', icon: Columns3 },
  ] },
]

function Brand() {
  return <NavLink className="brand" to="/" aria-label="SkySense home"><span className="brand-mark"><CloudSun size={25} /></span><span><strong>Sky</strong>Sense<small>Smart Weather Companion</small></span></NavLink>
}

export default function Navbar() {
  const { isAuthenticated, currentUser, logout } = useApp()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => { setMenuOpen(false); setProfileOpen(false) }, [location.pathname])
  const handleLogout = () => { logout(); navigate('/') }

  if (!isAuthenticated) {
    return <header className="topbar public-topbar"><div className="topbar-inner"><Brand />
      <button className="icon-button mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
      <nav className={`public-nav ${menuOpen ? 'is-open' : ''}`}>
        {publicLinks.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{link.label}</NavLink>)}
        <div className="nav-auth-actions"><NavLink className="button button-ghost button-small" to="/login"><LogIn size={16} /> Login</NavLink><NavLink className="button button-primary button-small" to="/signup"><UserRoundPlus size={16} /> Signup</NavLink><button className="icon-button" onClick={toggleTheme} aria-label="Toggle color theme">{theme === 'light' ? <Moon /> : <Sun />}</button></div>
      </nav>
    </div></header>
  }

  return <>
    <header className="topbar private-topbar"><div className="topbar-inner"><Brand /><div className="private-topbar-actions">
      <NavLink className="button button-soft button-small topbar-search" to="/search"><Search size={16} /> Search city</NavLink>
      <button className="icon-button" onClick={toggleTheme} aria-label="Toggle color theme">{theme === 'light' ? <Moon /> : <Sun />}</button>
      <div className="profile-menu-wrap"><button className="profile-trigger" onClick={() => setProfileOpen((open) => !open)}><span className="avatar">{currentUser?.fullName?.slice(0, 1).toUpperCase() || 'S'}</span><span><strong>{currentUser?.fullName}</strong><small>My weather</small></span><ChevronDown size={17} /></button>
        {profileOpen && <div className="profile-popover card"><NavLink to="/settings"><Settings size={17} /> Settings</NavLink><button onClick={handleLogout}><LogOut size={17} /> Logout</button></div>}
      </div>
      <button className="icon-button mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle workspace menu">{menuOpen ? <X /> : <Menu />}</button>
    </div></div></header>
    <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
      <div className="sidebar-intro"><span className="mini-icon"><Sparkles size={18} /></span><div><strong>Weather, made simple</strong><p>Only the tools you need for today and the week ahead.</p></div></div>
      {privateGroups.map((group) => <div className="sidebar-group" key={group.label}><p className="sidebar-label">{group.label}</p>{group.links.map(({ to, label, icon }) => <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>{createElement(icon, { size: 18 })}<span>{label}</span></NavLink>)}</div>)}
      <div className="sidebar-bottom"><NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><Settings size={18} /> Settings</NavLink><button className="sidebar-logout" onClick={handleLogout}><LogOut size={18} /> Logout</button></div>
    </aside>
    {menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
  </>
}
