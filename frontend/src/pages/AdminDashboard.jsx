import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import client from '../api/client';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import ProjectRow from '../components/ProjectRow';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([client.get('/admin/stats'), client.get('/admin/projects')]).then(([s, p]) => {
      setStats(s.data);
      setRecent(p.data.slice(0, 6));
    });
  }, []);

  return (
    <div>
      <Topbar title="Program overview" subtitle="Portfolio-wide status across all contractors" />

      {stats && (
        <>
          <div className="flex flex-wrap divide-x divide-line border-b border-line px-8">
            <StatCard label="Contractors onboarded" value={stats.totalContractors} />
            <StatCard label="Projects submitted" value={stats.totalProjects} />
            <StatCard label="Pending review" value={stats.byStatus.pending} accent="text-amber" />
            <StatCard label="Approved" value={stats.byStatus.approved} accent="text-forest" />
            <StatCard label="Avg. completeness" value={stats.avgCompleteness} suffix="/100" />
          </div>

          <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-2">
            <div className="border border-line bg-white p-5">
              <div className="text-xs uppercase tracking-wide text-slate">Submissions by category</div>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byCategory} layout="vertical" margin={{ left: 24 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={140}
                      tick={{ fontSize: 12, fill: '#44546B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2C6E8E" radius={[0, 2, 2, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-line bg-white p-5">
              <div className="text-xs uppercase tracking-wide text-slate">Submissions over time</div>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.byMonth}>
                    <CartesianGrid stroke="#DBE0E1" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#44546B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#44546B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#0F2C4C" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="px-8 pb-8">
        <div className="mb-3 text-xs uppercase tracking-wide text-slate">Recent submissions</div>
        <div className="border border-line">
          {recent.map((p) => (
            <ProjectRow key={p.id} project={p} to={`/admin/projects/${p.id}`} showContractor />
          ))}
        </div>
      </div>
    </div>
  );
}
