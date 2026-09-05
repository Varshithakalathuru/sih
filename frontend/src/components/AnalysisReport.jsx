import { riskColor } from './StatusBadge';

const SECTION_LABELS = {
  objective: 'Objective',
  scope: 'Scope of work',
  budget: 'Budget detail',
  timeline: 'Timeline',
  milestones: 'Milestones',
  risk: 'Risk plan',
};

const RECOMMENDATION_STYLE = {
  Approve: { bg: 'bg-forest/10', text: 'text-forest', border: 'border-forest/30' },
  'Review Required': { bg: 'bg-amber/10', text: 'text-amber', border: 'border-amber/30' },
  'Reject - Incomplete': { bg: 'bg-rust/10', text: 'text-rust', border: 'border-rust/30' },
};

export default function AnalysisReport({ analysis }) {
  if (!analysis) {
    return (
      <div className="border border-line bg-white px-6 py-8 text-center text-sm text-slate">
        No automated analysis is available for this submission.
      </div>
    );
  }

  const recStyle = RECOMMENDATION_STYLE[analysis.recommendation] || RECOMMENDATION_STYLE['Review Required'];

  return (
    <div className="border border-line bg-white">
      <div className="flex flex-col gap-6 border-b border-line p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <ScoreDial score={analysis.completenessScore} />
          <div>
            <div className="text-xs uppercase tracking-wide text-slate">Completeness score</div>
            <div className="font-mono text-2xl text-ink">{analysis.completenessScore}<span className="text-sm text-slate">/100</span></div>
          </div>
        </div>
        <div className="sm:pl-6 sm:border-l sm:border-line">
          <div className="text-xs uppercase tracking-wide text-slate">Risk level</div>
          <div className={`text-2xl font-medium ${riskColor(analysis.riskLevel)}`}>{analysis.riskLevel}</div>
        </div>
        <div className={`ml-auto rounded-sm border px-4 py-2 text-sm font-medium ${recStyle.bg} ${recStyle.text} ${recStyle.border}`}>
          {analysis.recommendation}
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm leading-relaxed text-slate">{analysis.summary}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(SECTION_LABELS).map(([key, label]) => {
            const found = analysis.sectionsFound?.[key];
            return (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border text-[10px] ${
                    found ? 'border-forest bg-forest text-white' : 'border-line text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span className={found ? 'text-ink' : 'text-slate/60'}>{label}</span>
              </div>
            );
          })}
        </div>

        {analysis.flags?.length > 0 && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wide text-slate">Flags for admin attention</div>
            <ul className="mt-2 space-y-1.5">
              {analysis.flags.map((flag, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <span className="text-amber">—</span>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.keywords?.length > 0 && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wide text-slate">Key terms detected</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {analysis.keywords.map((word) => (
                <span key={word} className="rounded-sm bg-paper px-2.5 py-1 text-xs text-slate">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-slate/70">Document word count: {analysis.wordCount}</div>
      </div>
    </div>
  );
}

function ScoreDial({ score }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#2F6F4E' : score >= 50 ? '#B5721A' : '#A23B2D';

  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={radius} stroke="#DBE0E1" strokeWidth="6" fill="none" />
      <circle
        cx="32"
        cy="32"
        r={radius}
        stroke={color}
        strokeWidth="6"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
      />
    </svg>
  );
}
