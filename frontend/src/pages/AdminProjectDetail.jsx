import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import Topbar from '../components/Topbar';
import StatusBadge from '../components/StatusBadge';
import AnalysisReport from '../components/AnalysisReport';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount
  );
}

const DECISIONS = [
  { key: 'approved', label: 'Approve', cls: 'bg-forest hover:bg-forest/90' },
  { key: 'needs_revision', label: 'Request revision', cls: 'bg-violet hover:bg-violet/90' },
  { key: 'rejected', label: 'Reject', cls: 'bg-rust hover:bg-rust/90' },
];

export default function AdminProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    client.get(`/admin/projects/${id}`).then((res) => {
      setProject(res.data);
      setRemarks(res.data.admin_remarks || '');
    });
  }

  useEffect(load, [id]);

  async function decide(status) {
    setSubmitting(true);
    try {
      await client.patch(`/admin/projects/${id}/decision`, { status, remarks });
      load();
    } finally {
      setSubmitting(false);
    }
  }

  if (!project) return <div className="p-8 text-sm text-slate">Loading…</div>;

  return (
    <div>
      <Topbar title={project.title} subtitle={`${project.contractor_name} · ${project.contractor_company || ''}`}>
        <StatusBadge status={project.status} />
      </Topbar>

      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalysisReport analysis={project.analysis} />

          <div className="mt-6 border border-line bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-slate">Decision</div>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Remarks for the contractor (visible to them)…"
              className="mt-2 w-full border border-line px-3 py-2 text-sm focus:border-steel"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {DECISIONS.map((d) => (
                <button
                  key={d.key}
                  disabled={submitting}
                  onClick={() => decide(d.key)}
                  className={`px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${d.cls}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 border border-line bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-slate">Review history</div>
            <ol className="mt-3 space-y-3">
              {project.history.map((h) => (
                <li key={h.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={h.status} />
                    <span className="text-xs text-slate/60">{new Date(h.changed_at).toLocaleString('en-IN')}</span>
                  </div>
                  {h.remark && <p className="mt-1 text-slate">{h.remark}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-line bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-slate">Project details</div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Category" value={project.category} />
              <Row label="Budget" value={formatCurrency(project.budget)} />
              <Row label="Start" value={project.start_date || '—'} />
              <Row label="End" value={project.end_date || '—'} />
              <Row label="Submitted" value={new Date(project.submitted_at).toLocaleDateString('en-IN')} />
            </dl>
            {project.description && <p className="mt-4 text-sm leading-relaxed text-slate">{project.description}</p>}
          </div>

          <Link
            to={`/admin/contractors/${project.contractor_id}`}
            className="block border border-line bg-white p-5 text-sm text-steel underline underline-offset-2"
          >
            View contractor profile & history
          </Link>

          {project.file_name && (
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${project.id}`}
              target="_blank"
              rel="noreferrer"
              className="block border border-line bg-white p-5 text-sm text-steel underline underline-offset-2"
            >
              Download attached report ({project.file_name})
            </a>
          )}

          <Link to="/admin/projects" className="block text-sm text-slate underline underline-offset-2">
            ← Back to review queue
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
