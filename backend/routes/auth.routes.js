const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password, company, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (name, email, password, role, company, phone) VALUES (?, ?, ?, ?, ?, ?)')
    .run(name, email.toLowerCase(), hash, 'contractor', company || null, phone || null);

  const user = { id: info.lastInsertRowid, name, email: email.toLowerCase(), role: 'contractor', company };
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!row || !bcrypt.compareSync(password, row.password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const user = { id: row.id, name: row.name, email: row.email, role: row.role, company: row.company };
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user });
});

module.exports = router;
