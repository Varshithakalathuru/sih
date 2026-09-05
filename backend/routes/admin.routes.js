const express = require('express');
const db = require('../db/connection');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireRole('admin'));

// GET /api/admin/projects?status=pending&category=Roads
router.get('/projects', (req, res) => {
  const { status, category, q } = req.query;
  let sql = `
    SELECT p.*, u.name AS contractor_name, u.company AS contractor_company
    FROM projects p JOIN users u ON u.id = p.contractor_id
    WHERE 1 = 1`;
  const params = [];

  if (status) {
    sql += ' AND p.status = ?';
    params.push(status);
  }
  if (category) {
    sql += ' AND p.category = ?';
    params.push(category);
  }
  if (q) {
    sql += ' AND (p.title LIKE ? OR u.name LIKE ? OR u.company LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += ' ORDER BY p.submitted_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(serializeProject));
});

// GET /api/admin/projects/:id
router.get('/projects/:id', (req, res) => {
  const project = db
    .prepare(
      `SELECT p.*, u.name AS contractor_name, u.company AS contractor_company, u.email AS contractor_email
       FROM projects p JOIN users u ON u.id = p.contractor_id WHERE p.id = ?`
    )
    .get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  const history = db
    .prepare('SELECT * FROM project_history WHERE project_id = ? ORDER BY changed_at ASC')
    .all(project.id);

  res.json({ ...serializeProject(project), history });
});

// PATCH /api/admin/projects/:id/decision  { status, remarks }
router.patch('/projects/:id/decision', (req, res) => {
  const { status, remarks } = req.body;
  const allowed = ['approved', 'rejected', 'needs_revision'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Status must be one of approved, rejected, needs_revision.' });
  }

  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  db.prepare(
    "UPDATE projects SET status = ?, admin_remarks = ?, decided_at = datetime('now') WHERE id = ?"
  ).run(status, remarks || null, project.id);

  db.prepare('INSERT INTO project_history (project_id, status, remark) VALUES (?, ?, ?)').run(
    project.id,
    status,
    remarks || null
  );

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(project.id);
  res.json(serializeProject(updated));
});

// GET /api/admin/contractors - directory with project counts
router.get('/contractors', (req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.company, u.phone, u.created_at,
              COUNT(p.id) AS total_projects,
              SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) AS approved_count,
              SUM(CASE WHEN p.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
              SUM(CASE WHEN p.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
              SUM(CASE WHEN p.status = 'needs_revision' THEN 1 ELSE 0 END) AS revision_count,
              COALESCE(SUM(p.budget), 0) AS total_budget
       FROM users u LEFT JOIN projects p ON p.contractor_id = u.id
       WHERE u.role = 'contractor'
       GROUP BY u.id
       ORDER BY total_projects DESC`
    )
    .all();
  res.json(rows);
});

// GET /api/admin/contractors/:id - profile + full project history
router.get('/contractors/:id', (req, res) => {
  const contractor = db
    .prepare("SELECT id, name, email, company, phone, created_at FROM users WHERE id = ? AND role = 'contractor'")
    .get(req.params.id);
  if (!contractor) return res.status(404).json({ error: 'Contractor not found.' });

  const projects = db
    .prepare('SELECT * FROM projects WHERE contractor_id = ? ORDER BY submitted_at DESC')
    .all(contractor.id)
    .map(serializeProject);

  res.json({ ...contractor, projects });
});

// GET /api/admin/stats - dashboard overview
router.get('/stats', (req, res) => {
  const totals = db.prepare('SELECT COUNT(*) AS count FROM projects').get().count;
  const contractors = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'contractor'").get().count;

  const byStatus = db.prepare('SELECT status, COUNT(*) AS count FROM projects GROUP BY status').all();
  const statusMap = { pending: 0, approved: 0, rejected: 0, needs_revision: 0 };
  for (const r of byStatus) statusMap[r.status] = r.count;

  const byCategory = db
    .prepare('SELECT category, COUNT(*) AS count FROM projects GROUP BY category ORDER BY count DESC')
    .all();

  const avgCompleteness = db
    .prepare('SELECT AVG(completeness_score) AS avg FROM projects WHERE completeness_score IS NOT NULL')
    .get().avg;

  const byMonth = db
    .prepare(
      `SELECT strftime('%Y-%m', submitted_at) AS month, COUNT(*) AS count
       FROM projects GROUP BY month ORDER BY month ASC`
    )
    .all();

  res.json({
    totalProjects: totals,
    totalContractors: contractors,
    byStatus: statusMap,
    byCategory,
    byMonth,
    avgCompleteness: avgCompleteness ? Math.round(avgCompleteness) : 0,
  });
});

function serializeProject(row) {
  return {
    ...row,
    analysis: row.analysis_json ? JSON.parse(row.analysis_json) : null,
  };
}

module.exports = router;
