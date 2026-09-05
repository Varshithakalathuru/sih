import { useEffect, useState } from 'react';
import client from '../api/client';
import Topbar from '../components/Topbar';
import ProjectRow from '../components/ProjectRow';

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'needs_revision', label: 'Needs revision' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminProjects() {
  const [tab, setTab] = useState('');
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (tab) params.status = tab;
    if (query) params.q = query;
    client.get('/admin/projects', { params }).then((res) => {
      setProjects(res.data);
      setLoading(false);
    });
  }, [tab, query]);

  return (
    <div>
      <Topbar title="Review queue" subtitle="All project submissions across contractors" />

      <div className="flex items-center justify-between border-b border-line px-8 py-3">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-sm px-3 py-1.5 text-sm transition-colors ${
                tab === t.key ? 'bg-ink text-white' : 'text-slate hover:bg-line/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or contractor…"
          className="w-64 border border-line px-3 py-1.5 text-sm focus:border-steel"
        />
      </div>

      <div className="px-8 py-6">
        {loading ? (
          <p className="text-sm text-slate">Loading…</p>
        ) : projects.length === 0 ? (
          <div className="border border-dashed border-line bg-white px-6 py-12 text-center text-sm text-slate">
            No projects match this filter.
          </div>
        ) : (
          <div className="border border-line">
            {projects.map((p) => (
              <ProjectRow key={p.id} project={p} to={`/admin/projects/${p.id}`} showContractor />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
