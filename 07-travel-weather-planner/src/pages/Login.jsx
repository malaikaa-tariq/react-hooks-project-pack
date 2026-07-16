import { useState } from 'react'
import { Eye, EyeOff, LogIn, Mail, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { validateLogin } from '../utils/validators'

export default function Login() {
  const { login, isAuthenticated } = useApp()
  const navigate = useNavigate(); const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' }); const [errors, setErrors] = useState({}); const [showPassword, setShowPassword] = useState(false)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  const submit = (event) => { event.preventDefault(); const next = validateLogin(form); if (Object.keys(next).length) return setErrors(next); const result = login(form); if (!result.ok) return setErrors({ [result.field]: result.message }); navigate(location.state?.from || '/dashboard') }
  return <div className="auth-page content-width"><section className="auth-visual auth-night"><div className="auth-visual-copy"><span className="hero-kicker"><ShieldCheck size={16} /> Personal weather workspace</span><h1>Welcome back to calmer daily planning.</h1><p>Your saved cities, forecasts, and activity plans are ready when you are.</p></div></section><section className="auth-card card"><div className="auth-heading"><span className="mini-icon"><LogIn /></span><p className="eyebrow">Sign in</p><h2>Continue with SkySense</h2></div><form onSubmit={submit} className="form-stack" noValidate><label className="form-field"><span>Email address</span><div className="input-with-icon"><Mail size={18} /><input type="email" value={form.email} onChange={(event) => { setForm({ ...form, email: event.target.value }); setErrors({ ...errors, email: '' }) }} placeholder="you@example.com" /></div>{errors.email && <small className="error-text">{errors.email}</small>}</label><label className="form-field"><span>Password</span><div className="input-with-icon"><ShieldCheck size={18} /><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => { setForm({ ...form, password: event.target.value }); setErrors({ ...errors, password: '' }) }} placeholder="Your password" /><button type="button" className="input-icon-button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <small className="error-text">{errors.password}</small>}</label><button className="button button-primary button-full" type="submit"><LogIn size={18} /> Login</button></form><p className="auth-switch">New to SkySense? <Link to="/signup">Create an account</Link></p></section></div>
}
