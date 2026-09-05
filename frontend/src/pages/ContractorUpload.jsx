import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Topbar from '../components/Topbar';

const CATEGORIES = [
  'Roads & Transport',
  'Urban Infrastructure',
  'Irrigation & Water',
  'Rural Development',
  'Power & Energy',
  'Health & Sanitation',
  'Education',
  'Other',
];

export default function ContractorUpload() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    budget: '',
    start_date: '',
    end_date: '',
  });
  const [file, setFile] = useState(null);
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
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      if (file) payload.append('document', file);

      const { data } = await client.post('/projects', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/projects/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to submit the project. Please check the form and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Topbar title="Submit a project" subtitle="Attach your project report for automated analysis" />

      <form onSubmit={handleSubmit} className="mx-8 my-6 max-w-2xl border border-line bg-white p-7">
        <Field label="Project title">
          <input required value={form.title} onChange={update('title')} className={inputCls} placeholder="e.g. Rural Road Connectivity - Phase II" />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={update('description')}
            rows={3}
            className={inputCls}
            placeholder="Brief summary of the project"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select value={form.category} onChange={update('category')} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Budget (INR)">
            <input required type="number" min="0" value={form.budget} onChange={update('budget')} className={inputCls} placeholder="4200000" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date">
            <input type="date" value={form.start_date} onChange={update('start_date')} className={inputCls} />
          </Field>
          <Field label="End date">
            <input type="date" value={form.end_date} onChange={update('end_date')} className={inputCls} />
          </Field>
        </div>

        <Field label="Project report (PDF, DOCX or TXT)">
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="mt-1.5 w-full border border-line px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-paper file:px-3 file:py-1.5 file:text-sm"
          />
          <p className="mt-1 text-xs text-slate/60">
            The report is analyzed automatically for objectives, scope, budget, timeline, milestones and risk planning.
          </p>
        </Field>

        {error && <p className="mt-3 text-sm text-rust">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-light disabled:opacity-60"
        >
          {submitting ? 'Analyzing and submitting…' : 'Submit for review'}
        </button>
      </form>
    </div>
  );
}

const inputCls = 'mt-1.5 w-full border border-line px-3 py-2 text-sm focus:border-steel';

function Field({ label, children }) {
  return (
    <div className="mt-4 first:mt-0">
      <label className="block text-xs font-medium uppercase tracking-wide text-slate">{label}</label>
      {children}
    </div>
  );
}
