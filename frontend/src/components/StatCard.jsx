export default function StatCard({ label, value, accent = 'text-ink', suffix }) {
  return (
    <div className="px-5 py-4 first:pl-0">
      <div className={`font-mono text-3xl font-medium leading-none ${accent}`}>
        {value}
        {suffix && <span className="ml-1 text-lg text-slate">{suffix}</span>}
      </div>
      <div className="mt-2 text-sm text-slate">{label}</div>
    </div>
  );
}
