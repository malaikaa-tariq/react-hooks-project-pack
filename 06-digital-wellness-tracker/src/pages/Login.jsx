import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import { useApp } from '../context/AppContext';
import { isEmail } from '../utils/validators';

export default function Login() {
  const { currentUser, login } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  if (currentUser) return <Navigate to="/dashboard" replace />;

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!isEmail(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Password is required.';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    const result = login(form.email, form.password);
    if (!result.ok) return setErrors({ [result.field]: result.message });
    const requested = location.state?.from;
    navigate(result.profileComplete ? requested || '/dashboard' : '/profile-setup', { replace: true });
  };

  return (
    <main className="auth-page">
      <section className="auth-visual login-visual image-auth-visual">
        <img src="/assets/profile-health-real.png" alt="A realistic digital wellness setup scene" />
        <div className="auth-quote"><strong>“</strong><p>Your attention deserves a space designed for recovery, not urgency.</p></div>
      </section>
      <section className="auth-panel">
        <Link className="brand auth-brand" to="/"><img src="/digibalance-mark.svg" alt="" /><span><strong>Digi</strong>Balance</span></Link>
        <div className="auth-copy"><span className="eyebrow">Welcome back</span><h1>Return to your calmer digital rhythm.</h1><p>Log in with the account you created on this browser.</p></div>
        <form className="auth-form" onSubmit={submit} noValidate>
          <FormField label="Email address" error={errors.email}><input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" /></FormField>
          <FormField label="Password" error={errors.password}><input name="password" type="password" value={form.password} onChange={update} placeholder="Enter your password" autoComplete="current-password" /></FormField>
          <button className="button button-full" type="submit">Login</button>
        </form>
        <p className="auth-switch">New to DigiBalance? <Link to="/signup">Create an account</Link></p>
      </section>
    </main>
  );
}
