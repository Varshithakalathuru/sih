import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Topbar from '../components/Topbar';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount
  );
}

export default function AdminContractors() {
  const [contractors, setContractors] = useState([]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    client.get('/admin/contractors').then((res) => setContractors(res.data));
  }, []);

  const filtered = contractors.filter((c) =>
    `${c.name} ${c.company}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <Topbar title="Contractors" subtitle={`${contractors.length} registered contractors`}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contractors…"
          className="w-64 border border-line px-3 py-1.5 text-sm focus:border-steel"
        />
      </Topbar>

      <div className="px-8 py-6">
        <div className="border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-slate">
                <th className="px-5 py-3 font-medium">Contractor</th>
                <th className="px-5 py-3 font-medium">Projects</th>
                <th className="px-5 py-3 font-medium">Approved</th>
                <th className="px-5 py-3 font-medium">Pending</th>
                <th className="px-5 py-3 font-medium">Revision</th>
                <th className="px-5 py-3 font-medium">Rejected</th>
                <th className="px-5 py-3 font-medium">Total value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/admin/contractors/${c.id}`)}
                  className="cursor-pointer border-b border-line last:border-0 hover:bg-paper"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-ink">{c.name}</div>
                    <div className="text-xs text-slate">{c.company}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono">{c.total_projects}</td>
                  <td className="px-5 py-3.5 font-mono text-forest">{c.approved_count}</td>
                  <td className="px-5 py-3.5 font-mono text-amber">{c.pending_count}</td>
                  <td className="px-5 py-3.5 font-mono text-violet">{c.revision_count}</td>
                  <td className="px-5 py-3.5 font-mono text-rust">{c.rejected_count}</td>
                  <td className="px-5 py-3.5 font-mono">{formatCurrency(c.total_budget)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
