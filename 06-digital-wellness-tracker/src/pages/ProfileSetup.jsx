import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import { useApp } from '../context/AppContext';
import { countries } from '../data/whoFallbackData';
import { validateProfile } from '../utils/validators';

const defaults = {
  fullName: '', email: '', ageRange: '', gender: '', occupation: '', mainDevice: '', screenGoal: 6, sleepTarget: 8,
  focusGoal: '', distractingApps: '', breakStyle: 'Short walk', wellnessGoal: '', stressLevel: 'Medium', preferredFocusTime: 'Morning', country: 'Pakistan',
  bpLevel: 'Unsure', sugarLevel: 'Unsure', activityLevel: 'Moderate', conditions: '',
};

export default function ProfileSetup() {
  const { profile, updateProfile } = useApp();
  const [form, setForm] = useState({ ...defaults, ...profile });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const completion = useMemo(() => {
    const keys = ['fullName', 'email', 'ageRange', 'gender', 'occupation', 'mainDevice', 'screenGoal', 'sleepTarget', 'focusGoal', 'wellnessGoal', 'country'];
    const filled = keys.filter((key) => String(form[key] ?? '').trim()).length;
    return Math.round((filled / keys.length) * 100);
  }, [form]);

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validateProfile(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    updateProfile(form);
    navigate('/dashboard');
  };

  return (
    <main className="private-page profile-page">
      <div className="private-shell narrow-private-shell">
        <section className="profile-intro profile-intro-strong">
          <div><span className="eyebrow light">Build a healthier setup</span><h1>Create a profile that feels like a health space, not a plain tracker.</h1><p>DigiBalance uses these details to shape your routines, wellness score, and health guidance.</p></div>
          <img src="/assets/profile-health-real.png" alt="A realistic digital wellness setup scene" />
        </section>

        <div className="profile-progress-strip"><span>Profile completion</span><strong>{completion}%</strong><i><b style={{ width: `${completion}%` }} /></i></div>

        <form className="profile-simple-form wellness-form" onSubmit={submit} noValidate>
          <section>
            <div className="panel-heading"><span>Your basics</span><h2>Who this space belongs to</h2></div>
            <div className="form-grid">
              <FormField label="Full name" error={errors.fullName}><input name="fullName" value={form.fullName} onChange={update} /></FormField>
              <FormField label="Email address" error={errors.email}><input name="email" type="email" value={form.email} onChange={update} /></FormField>
              <FormField label="Age range" error={errors.ageRange}><select name="ageRange" value={form.ageRange} onChange={update}><option value="">Select</option><option>Under 18</option><option>18–24</option><option>25–34</option><option>35–44</option><option>45–54</option><option>55+</option></select></FormField>
              <FormField label="Gender" error={errors.gender}><select name="gender" value={form.gender} onChange={update}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></FormField>
              <FormField label="Occupation"><select name="occupation" value={form.occupation} onChange={update}><option value="">Select</option><option>Student</option><option>Developer</option><option>Freelancer</option><option>Employee</option><option>Other</option></select></FormField>
              <FormField label="Main device"><select name="mainDevice" value={form.mainDevice} onChange={update}><option value="">Select</option><option>Phone</option><option>Laptop</option><option>Tablet</option><option>Multiple</option></select></FormField>
              <FormField label="Country for public wellness context" className="form-span"><select name="country" value={form.country} onChange={update}>{countries.map((country) => <option key={country.code}>{country.name}</option>)}</select></FormField>
            </div>
          </section>

          <section>
            <div className="panel-heading"><span>Your direction</span><h2>Choose realistic targets</h2></div>
            <div className="form-grid">
              <FormField label="Daily screen-time goal" error={errors.screenGoal} hint="1–16 hours"><input name="screenGoal" type="number" min="1" max="16" step="0.5" value={form.screenGoal} onChange={update} /></FormField>
              <FormField label="Sleep target" error={errors.sleepTarget} hint="4–10 hours"><input name="sleepTarget" type="number" min="4" max="10" step="0.5" value={form.sleepTarget} onChange={update} /></FormField>
              <FormField label="Focus goal" error={errors.focusGoal} className="form-span"><input name="focusGoal" value={form.focusGoal} onChange={update} placeholder="Two focused study blocks" /></FormField>
              <FormField label="Main wellness goal" error={errors.wellnessGoal} className="form-span"><select name="wellnessGoal" value={form.wellnessGoal} onChange={update}><option value="">Select</option><option>Reduce Screen Time</option><option>Improve Focus</option><option>Sleep Better</option><option>Reduce Social Media</option><option>Study Better</option><option>Work-Life Balance</option></select></FormField>
            </div>
          </section>

          <section>
            <div className="panel-heading"><span>Health-aware extras</span><h2>Add a little context</h2></div>
            <div className="form-grid">
              <FormField label="Stress level"><select name="stressLevel" value={form.stressLevel} onChange={update}><option>Low</option><option>Medium</option><option>High</option></select></FormField>
              <FormField label="Preferred focus time"><select name="preferredFocusTime" value={form.preferredFocusTime} onChange={update}><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option></select></FormField>
              <FormField label="Blood pressure"><select name="bpLevel" value={form.bpLevel} onChange={update}><option>Unsure</option><option>Normal</option><option>Elevated</option><option>High</option><option>Very high</option><option>Low</option></select></FormField>
              <FormField label="Blood sugar"><select name="sugarLevel" value={form.sugarLevel} onChange={update}><option>Unsure</option><option>Normal</option><option>Prediabetes</option><option>High</option><option>Diabetes</option><option>Low</option></select></FormField>
              <FormField label="Activity level"><select name="activityLevel" value={form.activityLevel} onChange={update}><option>Low</option><option>Moderate</option><option>Active</option></select></FormField>
              <FormField label="Known concern"><input name="conditions" value={form.conditions} onChange={update} placeholder="Optional: eye strain, headaches, stress…" /></FormField>
            </div>
          </section>

          <button className="button button-full profile-save" type="submit">Save profile and continue</button>
        </form>
      </div>
    </main>
  );
}
