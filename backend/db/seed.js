const bcrypt = require('bcryptjs');
const db = require('./connection');

function upsertUser({ name, email, password, role, company, phone }) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return existing.id;
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (name, email, password, role, company, phone) VALUES (?, ?, ?, ?, ?, ?)')
    .run(name, email, hash, role, company || null, phone || null);
  return info.lastInsertRowid;
}

function insertProject(p) {
  const info = db
    .prepare(
      `INSERT INTO projects
        (contractor_id, title, description, category, budget, start_date, end_date, status,
         admin_remarks, analysis_json, completeness_score, risk_level, submitted_at, decided_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      p.contractor_id,
      p.title,
      p.description,
      p.category,
      p.budget,
      p.start_date,
      p.end_date,
      p.status,
      p.admin_remarks,
      p.analysis_json,
      p.completeness_score,
      p.risk_level,
      p.submitted_at,
      p.decided_at
    );
  db.prepare('INSERT INTO project_history (project_id, status, remark) VALUES (?, ?, ?)').run(
    info.lastInsertRowid,
    p.status,
    p.status === 'pending' ? 'Submitted for review' : p.admin_remarks || 'Status updated'
  );
  return info.lastInsertRowid;
}

const adminId = upsertUser({
  name: 'MoSPI Program Officer',
  email: 'admin@mospi.gov.in',
  password: 'admin123',
  role: 'admin',
  company: 'Ministry of Statistics and Programme Implementation',
});

const c1 = upsertUser({
  name: 'Ramesh Iyer',
  email: 'ramesh@buildright.co.in',
  password: 'contractor123',
  role: 'contractor',
  company: 'BuildRight Infra Pvt. Ltd.',
  phone: '9876543210',
});

const c2 = upsertUser({
  name: 'Ananya Desai',
  email: 'ananya@urbanpath.co.in',
  password: 'contractor123',
  role: 'contractor',
  company: 'UrbanPath Constructions',
  phone: '9123456780',
});

const c3 = upsertUser({
  name: 'Suresh Nair',
  email: 'suresh@greenlinecivil.in',
  password: 'contractor123',
  role: 'contractor',
  company: 'Greenline Civil Works',
  phone: '9988776655',
});

const existingProjects = db.prepare('SELECT COUNT(*) AS c FROM projects').get().c;

if (existingProjects === 0) {
  insertProject({
    contractor_id: c1,
    title: 'Rural Road Connectivity - Phase II, Nashik District',
    description:
      'Construction of a 12km all-weather rural road connecting five villages, including culverts and drainage. Objective is last-mile connectivity for agricultural markets. Scope of work covers earthwork, sub-base, bituminous surfacing and signage. Budget estimate Rs. 4,20,00,000. Timeline of 14 months with monthly milestones. Risk mitigation plan includes monsoon contingency scheduling.',
    category: 'Roads & Transport',
    budget: 42000000,
    start_date: '2026-04-01',
    end_date: '2027-06-01',
    status: 'approved',
    admin_remarks: 'Well-documented submission with clear milestones. Approved.',
    analysis_json: JSON.stringify({
      wordCount: 612,
      sectionsFound: { objective: true, scope: true, budget: true, timeline: true, milestones: true, risk: true },
      keywords: ['road', 'culvert', 'drainage', 'bituminous', 'connectivity', 'monsoon', 'milestone', 'earthwork'],
      flags: [],
      completenessScore: 96,
      riskLevel: 'Low',
      recommendation: 'Approve',
      summary:
        'The proposal covers all required sections with a realistic budget-to-duration ratio and an explicit risk mitigation plan for seasonal delays.',
    }),
    completeness_score: 96,
    risk_level: 'Low',
    submitted_at: '2026-02-10 09:12:00',
    decided_at: '2026-02-14 11:00:00',
  });

  insertProject({
    contractor_id: c2,
    title: 'Urban Solid Waste Segregation Units - Pune Ward 14',
    description:
      'Setup of 8 decentralised waste segregation and composting units across Ward 14. Includes civil work, machinery procurement and a 3-month operator training program.',
    category: 'Urban Infrastructure',
    budget: 9800000,
    start_date: '2026-05-15',
    end_date: '2026-11-15',
    status: 'pending',
    admin_remarks: null,
    analysis_json: JSON.stringify({
      wordCount: 238,
      sectionsFound: { objective: true, scope: true, budget: true, timeline: false, milestones: false, risk: false },
      keywords: ['waste', 'segregation', 'composting', 'ward', 'machinery', 'training'],
      flags: [
        'No explicit month-by-month timeline found',
        'No milestone breakdown found',
        'No risk mitigation section found',
      ],
      completenessScore: 58,
      riskLevel: 'Medium',
      recommendation: 'Review Required',
      summary:
        'Objective, scope and budget are clear, but the document is missing a phased timeline, milestones and risk planning, which the admin should request before approval.',
    }),
    completeness_score: 58,
    risk_level: 'Medium',
    submitted_at: '2026-08-20 14:45:00',
    decided_at: null,
  });

  insertProject({
    contractor_id: c2,
    title: 'Smart Streetlight Retrofit - Sector 21',
    description: 'Replacement of 450 sodium-vapour streetlights with IoT-enabled LED fixtures.',
    category: 'Urban Infrastructure',
    budget: 6200000,
    start_date: '2026-03-01',
    end_date: '2026-06-01',
    status: 'needs_revision',
    admin_remarks: 'Please attach the IoT vendor SLA and a clear commissioning schedule before resubmission.',
    analysis_json: JSON.stringify({
      wordCount: 96,
      sectionsFound: { objective: true, scope: false, budget: true, timeline: false, milestones: false, risk: false },
      keywords: ['streetlight', 'led', 'iot', 'retrofit', 'sector'],
      flags: [
        'Scope of work is too brief to assess coverage',
        'No timeline or milestones found',
        'No risk mitigation section found',
        'Supporting document is very short for a project of this budget',
      ],
      completenessScore: 34,
      riskLevel: 'High',
      recommendation: 'Reject - Incomplete',
      summary:
        'The uploaded document is too brief to evaluate scope, timeline or risk. Contractor should resubmit with full details.',
    }),
    completeness_score: 34,
    risk_level: 'High',
    submitted_at: '2026-07-02 10:05:00',
    decided_at: '2026-07-05 09:30:00',
  });

  insertProject({
    contractor_id: c3,
    title: 'Watershed Development Program - Beed Taluka',
    description:
      'Construction of check dams and contour trenches across 6 micro-watersheds to improve groundwater recharge. Objective, scope, budget breakup, quarterly milestones and a detailed risk register covering rainfall variability are included.',
    category: 'Irrigation & Water',
    budget: 15600000,
    start_date: '2026-06-01',
    end_date: '2027-05-31',
    status: 'pending',
    admin_remarks: null,
    analysis_json: JSON.stringify({
      wordCount: 540,
      sectionsFound: { objective: true, scope: true, budget: true, timeline: true, milestones: true, risk: true },
      keywords: ['watershed', 'check dam', 'trench', 'groundwater', 'recharge', 'rainfall', 'milestone'],
      flags: [],
      completenessScore: 93,
      riskLevel: 'Low',
      recommendation: 'Approve',
      summary:
        'A thorough submission covering every required section with quarterly milestones and an explicit rainfall risk register.',
    }),
    completeness_score: 93,
    risk_level: 'Low',
    submitted_at: '2026-08-28 16:20:00',
    decided_at: null,
  });

  console.log('Seed complete.');
} else {
  console.log('Projects already exist, skipping project seed.');
}

console.log('Admin login: admin@mospi.gov.in / admin123');
console.log('Contractor logins: ramesh@buildright.co.in / ananya@urbanpath.co.in / suresh@greenlinecivil.in (password: contractor123)');
