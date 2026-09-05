const fs = require('fs');
const path = require('path');

/**
 * Extracts raw text from an uploaded project document.
 * Supports PDF, DOCX and TXT. Falls back gracefully for unsupported types.
 */
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.txt') {
      return fs.readFileSync(filePath, 'utf8');
    }

    if (ext === '.pdf') {
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text || '';
    }

    if (ext === '.docx') {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }

    // .doc (legacy binary) has no reliable pure-JS parser here.
    return '';
  } catch (err) {
    return '';
  }
}

const SECTION_PATTERNS = {
  objective: /\b(objective|goal|purpose|aim)s?\b/i,
  scope: /\b(scope of work|project scope|scope\b)/i,
  budget: /\b(budget|cost estimate|estimated cost|financial outlay|₹|rs\.?\s?\d|inr)\b/i,
  timeline: /\b(timeline|schedule|duration|completion period|phase[sd]?)\b/i,
  milestones: /\b(milestone|deliverable|monthly|quarterly)s?\b/i,
  risk: /\b(risk|mitigation|contingency|challenge)s?\b/i,
};

const STOPWORDS = new Set(
  'the of a to and in for on with is are be will this that as by an at from or which project work works shall has have not it its within into any other such may these those been being was were'.split(
    ' '
  )
);

function topKeywords(text, count = 8) {
  const freq = new Map();
  const words = (text.toLowerCase().match(/[a-z]{4,}/g) || []).filter((w) => !STOPWORDS.has(w));
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * Runs a rule-based "smart" analysis over the extracted text and project metadata,
 * producing a structured report an admin can act on without reading the whole document.
 */
async function analyzeProject({ filePath, budget, startDate, endDate }) {
  const hasFile = Boolean(filePath && fs.existsSync(filePath));
  const text = hasFile ? await extractText(filePath) : '';
  const wordCount = (text.match(/\S+/g) || []).length;

  const sectionsFound = {};
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    sectionsFound[key] = pattern.test(text);
  }

  const flags = [];

  if (!hasFile) {
    flags.push('No supporting document was attached for automated review.');
  } else if (wordCount === 0) {
    flags.push('The document could not be read automatically (unsupported or scanned format).');
  } else {
    if (wordCount < 150) flags.push('Supporting document is very brief for a project of this scope.');
    if (!sectionsFound.objective) flags.push('No clear objective / purpose statement found.');
    if (!sectionsFound.scope) flags.push('No clearly defined scope of work found.');
    if (!sectionsFound.budget) flags.push('No budget or cost estimate details found in the document.');
    if (!sectionsFound.timeline) flags.push('No explicit timeline or schedule found.');
    if (!sectionsFound.milestones) flags.push('No milestone or deliverable breakdown found.');
    if (!sectionsFound.risk) flags.push('No risk mitigation or contingency plan found.');
  }

  // Sanity check: duration vs budget scale (very rough heuristic, flags extreme mismatches only)
  if (startDate && endDate) {
    const months = Math.max(
      1,
      Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 30))
    );
    const perMonth = budget / months;
    if (perMonth > 5 * 10000000) {
      flags.push('Budget-to-duration ratio is unusually high; recommend a closer financial review.');
    }
  }

  const sectionScore = hasFile && wordCount > 0
    ? (Object.values(sectionsFound).filter(Boolean).length / 6) * 70
    : 0;
  const lengthScore = Math.min(30, Math.round((wordCount / 500) * 30));
  const completenessScore = Math.max(0, Math.min(100, Math.round(sectionScore + lengthScore)));

  let riskLevel = 'Low';
  if (flags.length >= 4 || completenessScore < 45) riskLevel = 'High';
  else if (flags.length >= 2 || completenessScore < 75) riskLevel = 'Medium';

  let recommendation = 'Approve';
  if (completenessScore < 50 || riskLevel === 'High') recommendation = 'Reject - Incomplete';
  else if (completenessScore < 80 || riskLevel === 'Medium') recommendation = 'Review Required';

  const summary = buildSummary({ hasFile, wordCount, sectionsFound, completenessScore, riskLevel });

  return {
    wordCount,
    sectionsFound,
    keywords: hasFile ? topKeywords(text) : [],
    flags,
    completenessScore,
    riskLevel,
    recommendation,
    summary,
  };
}

function buildSummary({ hasFile, wordCount, sectionsFound, completenessScore, riskLevel }) {
  if (!hasFile || wordCount === 0) {
    return 'No readable supporting document was found. The admin should request a proper project report before this submission can be evaluated.';
  }
  const missing = Object.entries(sectionsFound)
    .filter(([, found]) => !found)
    .map(([key]) => key);

  if (missing.length === 0) {
    return `The submission covers all expected sections (objective, scope, budget, timeline, milestones and risk) with a completeness score of ${completenessScore}/100 and ${riskLevel.toLowerCase()} risk.`;
  }
  return `The submission is missing ${missing.length} expected section${missing.length > 1 ? 's' : ''} (${missing.join(
    ', '
  )}), giving a completeness score of ${completenessScore}/100 and ${riskLevel.toLowerCase()} risk.`;
}

module.exports = { analyzeProject };
