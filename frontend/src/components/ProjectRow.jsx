import { useNavigate } from 'react-router-dom';
import StatusBadge, { riskColor } from './StatusBadge';

const STRIPE = {
  pending: 'border-l-amber',
  approved: 'border-l-forest',
  rejected: 'border-l-rust',
  needs_revision: 'border-l-violet',
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount
  );
}

export default function ProjectRow({ project, to, showContractor = false }) {
  const navigate = useNavigate();
  const stripe = STRIPE[project.status] || STRIPE.pending;

  return (
    <button
      onClick={() => navigate(to)}
      className={`flex w-full items-center gap-6 border-b border-line border-l-2 ${stripe} bg-white px-5 py-4 text-left transition-colors hover:bg-paper`}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-ink">{project.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate">
          <span>{project.category}</span>
          <span className="text-line">•</span>
          <span className="font-mono">{formatCurrency(project.budget)}</span>
          {showContractor && (
            <>
              <span className="text-line">•</span>
              <span>{project.contractor_name}</span>
            </>
          )}
        </div>
      </div>

      {project.completeness_score !== null && project.completeness_score !== undefined && (
        <div className="hidden text-right sm:block">
          <div className="font-mono text-sm text-ink">{project.completeness_score}%</div>
          <div className={`text-xs ${riskColor(project.risk_level)}`}>{project.risk_level} risk</div>
        </div>
      )}

      <div className="w-32 flex-shrink-0 text-right">
        <StatusBadge status={project.status} />
      </div>
    </button>
  );
}
