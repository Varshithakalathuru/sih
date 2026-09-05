import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import ProjectRow from '../components/ProjectRow';

export default function AdminContractorProfile() {
  const { id } = useParams();
  const [contractor, setContractor] = useState(null);

  useEffect(() => {
    client.get(`/admin/contractors/${id}`).then((res) => setContractor(res.data));
  }, [id]);

  if (!contractor) return <div className="p-8 text-sm text-slate">Loading…</div>;

  const counts = contractor.projects.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0, needs_revision: 0 }
  );

  return (
    <div>
      <Topbar title={contractor.name} subtitle={contractor.company} />

      <div className="flex flex-wrap divide-x divide-line border-b border-line px-8">
        <StatCard label="Total projects" value={contractor.projects.length} />
        <StatCard label="Approved" value={counts.approved} accent="text-forest" />
        <StatCard label="Pending" value={counts.pending} accent="text-amber" />
        <StatCard label="Needs revision" value={counts.needs_revision} accent="text-violet" />
        <StatCard label="Rejected" value={counts.rejected} accent="text-rust" />
      </div>

      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 text-xs uppercase tracking-wide text-slate">Project history</div>
          <div className="border border-line">
            {contractor.projects.map((p) => (
              <ProjectRow key={p.id} project={p} to={`/admin/projects/${p.id}`} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-line bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-slate">Contact</div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Email" value={contractor.email} />
              <Row label="Phone" value={contractor.phone || '—'} />
              <Row label="Registered" value={new Date(contractor.created_at).toLocaleDateString('en-IN')} />
            </dl>
          </div>
          <Link to="/admin/contractors" className="block text-sm text-slate underline underline-offset-2">
            ← Back to contractors
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
