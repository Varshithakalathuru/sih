const express = require('express');
const path = require('path');
const db = require('../db/connection');
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { analyzeProject } = require('../services/analysisEngine');

const router = express.Router();

router.use(verifyToken, requireRole('contractor'));

// GET /api/projects - all projects submitted by the logged-in contractor
router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM projects WHERE contractor_id = ? ORDER BY submitted_at DESC')
    .all(req.user.id);
  res.json(rows.map(serializeProject));
});

// GET /api/projects/stats - quick counts for the contractor dashboard
router.get('/stats', (req, res) => {
  const rows = db.prepare('SELECT status, COUNT(*) AS count FROM projects WHERE contractor_id = ? GROUP BY status').all(req.user.id);
  const stats = { pending: 0, approved: 0, rejected: 0, needs_revision: 0 };
  for (const r of rows) stats[r.status] = r.count;
  stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
  res.json(stats);
});

// GET /api/projects/:id - single project with history, scoped to the owner
router.get('/:id', (req, res) => {
  const project = db
    .prepare('SELECT * FROM projects WHERE id = ? AND contractor_id = ?')
    .get(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  const history = db
    .prepare('SELECT * FROM project_history WHERE project_id = ? ORDER BY changed_at ASC')
    .all(project.id);

  res.json({ ...serializeProject(project), history });
});

// POST /api/projects - submit a new project with a supporting document
router.post('/', upload.single('document'), async (req, res) => {
  try {
    const { title, description, category, budget, start_date, end_date } = req.body;
    if (!title || !category || !budget) {
      return res.status(400).json({ error: 'Title, category and budget are required.' });
    }

    const filePath = req.file ? req.file.path : null;
    const analysis = await analyzeProject({
      filePath,
      budget: Number(budget),
      startDate: start_date,
      endDate: end_date,
    });

    const info = db
      .prepare(
        `INSERT INTO projects
          (contractor_id, title, description, category, budget, start_date, end_date,
           file_name, file_path, status, analysis_json, completeness_score, risk_level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
      )
      .run(
        req.user.id,
        title,
        description || '',
        category,
        Number(budget),
        start_date || null,
        end_date || null,
        req.file ? req.file.originalname : null,
        filePath,
        JSON.stringify(analysis),
        analysis.completenessScore,
        analysis.riskLevel
      );

    db.prepare('INSERT INTO project_history (project_id, status, remark) VALUES (?, ?, ?)').run(
      info.lastInsertRowid,
      'pending',
      'Submitted for review. Automated analysis complete.'
    );

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(serializeProject(project));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to submit project.' });
  }
});

function serializeProject(row) {
  return {
    ...row,
    analysis: row.analysis_json ? JSON.parse(row.analysis_json) : null,
  };
}

module.exports = router;
