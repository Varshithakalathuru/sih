const express = require('express');
const db = require('../db/connection');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/files/:projectId - download the document attached to a project.
// Accessible to the owning contractor or any admin.
router.get('/:projectId', verifyToken, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.projectId);
  if (!project || !project.file_path) {
    return res.status(404).json({ error: 'No document found for this project.' });
  }

  const isOwner = req.user.role === 'contractor' && req.user.id === project.contractor_id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'You do not have access to this document.' });
  }

  res.download(project.file_path, project.file_name || 'document');
});

module.exports = router;
