import { useState } from 'react'
import { Download, LogOut, Moon, Save, Sun, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { weatherInterests } from '../data/demoData'
import { downloadText } from '../utils/helpers'

export default function Settings() {
  const {
    profile,
    updateProfile,
    activeWeather,
    savedCities,
    activityPlans,
    clearCurrentData,
    logout,
  } = useApp()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: profile?.fullName || '',
    email: profile?.email || '',
    defaultCity: profile?.defaultCity || 'Karachi',
    unit: profile?.unit || 'celsius',
    interest: profile?.interest || 'General',
  })

  const submit = (event) => {
    event.preventDefault()
    if (!form.fullName.trim() || !form.defaultCity.trim()) return
    updateProfile(form)
  }

  const exportSummary = () => {
    downloadText(
      'skysense-weather-summary.txt',
      `SkySense Weather Summary\n\nCity: ${activeWeather?.location?.name}\nTemperature: ${Math.round(activeWeather?.current?.temperature || 0)}°\nRain chance: ${Math.round(activeWeather?.current?.rainChance || 0)}%\nWind: ${Math.round(activeWeather?.current?.windSpeed || 0)} km/h\nSaved cities: ${savedCities.length}\nActivity plans: ${activityPlans.length}`,
    )
  }

  const clear = () => {
    if (window.confirm('Clear saved cities, searches, and activity plans? Your profile will remain.')) {
      clearCurrentData()
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="page private-page content-width-private">
      <div className="page-heading settings-page-heading">
        <p className="eyebrow">Make SkySense yours</p>
        <h1>Settings</h1>
        <p>Manage your profile, preferred unit, appearance, and saved weather data.</p>
      </div>

      <section className="settings-layout">
        <form className="card settings-profile" onSubmit={submit}>
          <div className="section-title-row">
            <span className="mini-icon"><Save /></span>
            <div>
              <h2>Profile and preferences</h2>
              <p>These choices shape your default dashboard.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Full name</span>
              <input
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />
            </label>

            <label className="form-field">
              <span>Email</span>
              <input value={form.email} disabled />
            </label>

            <label className="form-field">
              <span>Default city</span>
              <input
                value={form.defaultCity}
                onChange={(event) => setForm({ ...form, defaultCity: event.target.value })}
              />
            </label>

            <label className="form-field">
              <span>Temperature unit</span>
              <select
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
              >
                <option value="celsius">Celsius</option>
                <option value="fahrenheit">Fahrenheit</option>
              </select>
            </label>

            <label className="form-field form-field-full">
              <span>Weather interest</span>
              <select
                value={form.interest}
                onChange={(event) => setForm({ ...form, interest: event.target.value })}
              >
                {weatherInterests.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <button className="button button-primary" type="submit">
            <Save size={17} /> Save Preferences
          </button>
        </form>

        <div className="settings-cards">
          <article className="card settings-card">
            <div className="settings-card-copy">
              <p className="eyebrow">Appearance</p>
              <h3>Color theme</h3>
              <p>Switch the interface theme.</p>
            </div>
            <button className="icon-button theme-large" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon /> : <Sun />}
            </button>
          </article>

          <article className="card settings-card">
            <div className="settings-card-copy">
              <p className="eyebrow">Summary</p>
              <h3>Export forecast</h3>
              <p>Download a text weather summary.</p>
            </div>
            <button className="button button-soft settings-small-button" onClick={exportSummary}>
              <Download size={16} /> Export
            </button>
          </article>

          <article className="card settings-card danger-zone">
            <div className="settings-card-copy">
              <p className="eyebrow">Data</p>
              <h3>Clear saved data</h3>
              <p>Remove saved weather items.</p>
            </div>
            <button className="button button-danger settings-small-button" onClick={clear}>
              <Trash2 size={16} /> Clear
            </button>
          </article>

          <article className="card settings-card">
            <div className="settings-card-copy">
              <p className="eyebrow">Account</p>
              <h3>Sign out</h3>
              <p>End your current session.</p>
            </div>
            <button className="button button-ghost settings-small-button" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </article>
        </div>
      </section>
    </div>
  )
}
