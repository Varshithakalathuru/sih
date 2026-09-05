export default function Topbar({ title, subtitle, children }) {
  return (
    <header className="flex items-start justify-between border-b border-line px-8 py-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
