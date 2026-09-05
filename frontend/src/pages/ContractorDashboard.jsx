import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import ProjectRow from '../components/ProjectRow';

export default function ContractorDashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([client.get('/projects/stats'), client.get('/projects')]).then(([s, p]) => {
      setStats(s.data);
      setProjects(p.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <Topbar title="Your projects" subtitle="Track submissions and their review status">
        <Link to="/submit" className="bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-light">
          Submit a project
        </Link>
      </Topbar>

      {stats && (
        <div className="flex divide-x divide-line border-b border-line px-8">
          <StatCard label="Total submitted" value={stats.total} />
          <StatCard label="Pending review" value={stats.pending} accent="text-amber" />
          <StatCard label="Approved" value={stats.approved} accent="text-forest" />
          <StatCard label="Needs revision" value={stats.needs_revision} accent="text-violet" />
          <StatCard label="Rejected" value={stats.rejected} accent="text-rust" />
        </div>
      )}

      <div className="px-8 py-6">
        {loading ? (
          <p className="text-sm text-slate">Loading your projects…</p>
        ) : projects.length === 0 ? (
          <div className="border border-dashed border-line bg-white px-6 py-12 text-center">
            <p className="text-sm text-slate">You haven't submitted any projects yet.</p>
            <Link to="/submit" className="mt-3 inline-block text-sm text-steel underline underline-offset-2">
              Submit your first project
            </Link>
          </div>
        ) : (
          <div className="border border-line">
            {projects.map((p) => (
              <ProjectRow key={p.id} project={p} to={`/projects/${p.id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
