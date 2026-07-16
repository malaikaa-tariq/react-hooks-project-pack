import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import { useApp } from '../context/AppContext';
import { validateSignup } from '../utils/validators';

const initial = { fullName: '', email: '', password: '', confirmPassword: '', ageRange: '', mainDevice: '', screenGoal: 6 };

export default function Signup() {
  const { currentUser, signUp, users } = useApp();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  if (currentUser) return <Navigate to="/dashboard" replace />;

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validateSignup(form, users);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const result = signUp(form);
    if (!result.ok) return setErrors({ email: result.message });
    navigate('/profile-setup');
  };

  return (
    <main className="auth-page signup-page">
      <section className="auth-visual signup-visual image-auth-visual">
        <img src="/assets/dashboard-health-real.png" alt="A realistic digital wellness workspace" />
        <div className="signup-mini-card"><b>Start simple</b><p>Notice one pattern, protect one habit.</p><small>You can choose popup guidance after setup.</small></div>
      </section>
      <section className="auth-panel auth-panel-wide">
        <Link className="brand auth-brand" to="/"><img src="/digibalance-mark.svg" alt="" /><span><strong>Digi</strong>Balance</span></Link>
        <div className="auth-copy"><span className="eyebrow">Create your wellness space</span><h1>Start with a realistic screen-time goal.</h1><p>Your account and tracker data stay in this browser.</p></div>
        <form className="auth-form two-column-form" onSubmit={submit} noValidate>
          <FormField label="Full name" error={errors.fullName}><input name="fullName" value={form.fullName} onChange={update} placeholder="Your full name" autoComplete="name" /></FormField>
          <FormField label="Email address" error={errors.email}><input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" /></FormField>
          <FormField label="Password" error={errors.password}><input name="password" type="password" value={form.password} onChange={update} placeholder="At least 6 characters" autoComplete="new-password" /></FormField>
          <FormField label="Confirm password" error={errors.confirmPassword}><input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} placeholder="Repeat password" autoComplete="new-password" /></FormField>
          <FormField label="Age range" error={errors.ageRange}><select name="ageRange" value={form.ageRange} onChange={update}><option value="">Select age range</option><option>Under 18</option><option>18–24</option><option>25–34</option><option>35–44</option><option>45–54</option><option>55+</option></select></FormField>
          <FormField label="Main device" error={errors.mainDevice}><select name="mainDevice" value={form.mainDevice} onChange={update}><option value="">Select main device</option><option>Phone</option><option>Laptop</option><option>Tablet</option><option>Multiple</option></select></FormField>
          <FormField label="Daily screen-time goal" error={errors.screenGoal} hint="Choose between 1 and 16 hours." className="form-span"><input name="screenGoal" type="number" min="1" max="16" step="0.5" value={form.screenGoal} onChange={update} /></FormField>
          <button className="button button-full form-span" type="submit">Create account</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </section>
    </main>
  );
}
