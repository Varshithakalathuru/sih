const STYLES = {
  pending: { label: 'Pending review', dot: 'bg-amber', text: 'text-amber' },
  approved: { label: 'Approved', dot: 'bg-forest', text: 'text-forest' },
  rejected: { label: 'Rejected', dot: 'bg-rust', text: 'text-rust' },
  needs_revision: { label: 'Needs revision', dot: 'bg-violet', text: 'text-violet' },
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export function riskColor(riskLevel) {
  if (riskLevel === 'Low') return 'text-forest';
  if (riskLevel === 'Medium') return 'text-amber';
  return 'text-rust';
}
