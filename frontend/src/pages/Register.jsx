import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create your account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-serif text-2xl font-semibold text-ink">Register as a contractor</div>
          <div className="mt-1 text-sm text-slate">Create an account to submit projects for review</div>
        </div>

        <form onSubmit={handleSubmit} className="border border-line bg-white p-7">
          <Field label="Full name" value={form.name} onChange={update('name')} required />
          <Field label="Company" value={form.company} onChange={update('company')} />
          <Field label="Email" type="email" value={form.email} onChange={update('email')} required />
          <Field label="Phone" value={form.phone} onChange={update('phone')} />
          <Field label="Password" type="password" value={form.password} onChange={update('password')} required hint="At least 6 characters" />

          {error && <p className="mt-3 text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full bg-ink py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-light disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate">
          Already registered?{' '}
          <Link to="/login" className="text-steel underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, hint, ...props }) {
  return (
    <div className="mt-4 first:mt-0">
      <label className="block text-xs font-medium uppercase tracking-wide text-slate">{label}</label>
      <input {...props} className="mt-1.5 w-full border border-line px-3 py-2 text-sm focus:border-steel" />
      {hint && <p className="mt-1 text-xs text-slate/60">{hint}</p>}
    </div>
  );
}
