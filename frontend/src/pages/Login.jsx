import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-serif text-2xl font-semibold text-ink">MoSPI Project Monitor</div>
          <div className="mt-1 text-sm text-slate">Sign in to review or submit project reports</div>
        </div>

        <form onSubmit={handleSubmit} className="border border-line bg-white p-7">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full border border-line px-3 py-2 text-sm focus:border-steel"
            placeholder="you@example.com"
          />

          <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-slate">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full border border-line px-3 py-2 text-sm focus:border-steel"
            placeholder="••••••••"
          />

          {error && <p className="mt-3 text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full bg-ink py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-light disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate">
          Contractor without an account?{' '}
          <Link to="/register" className="text-steel underline underline-offset-2">
            Register here
          </Link>
        </p>

        <div className="mt-8 border-t border-line pt-5 text-xs text-slate/70">
          <div className="font-medium text-slate">Demo logins</div>
          <div className="mt-1">Admin — admin@mospi.gov.in / admin123</div>
          <div>Contractor — ramesh@buildright.co.in / contractor123</div>
        </div>
      </div>
    </div>
  );
}
