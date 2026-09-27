const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite Database (In-Memory for Prototype)
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite in-memory database.');
        initDb();
    }
});

function initDb() {
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error executing schema', err.message);
        } else {
            console.log('Schema executed successfully.');
            seedData();
        }
    });
}

function seedData() {
    // 1. Seed Users
    const users = [
        ['citizen-1', 'Ramesh Kumar', 'Citizen', '9000000001', '1234'],
        ['owner-1', 'Suresh Patel', 'Land Owner', '9000000002', '1234'],
        ['survey-1', 'Amit Singh', 'Survey Officer', '9000000003', '1234'],
        ['revenue-1', 'Priya Sharma', 'Revenue Officer', '9000000004', '1234'],
        ['admin-1', 'Admin User', 'Admin', '9000000005', '1234']
    ];
    
    const stmtUser = db.prepare('INSERT INTO users (id, name, role, mobile, password_or_otp) VALUES (?, ?, ?, ?, ?)');
    users.forEach(u => stmtUser.run(u));
    stmtUser.finalize();

    // 2. Seed Lands
    const lands = [
        ['LAND-IND-001', 'owner-1', 'Sector 12, Plot 45, Delhi', 1500, 28.6139, 77.2090, 'Survey', 10, 0],
        ['LAND-IND-002', 'owner-1', 'Greenfield Hwy, Phase 1', 3200, 28.6200, 77.2150, 'Legal Verification', 60, 5], // high risk/delayed
        ['LAND-IND-003', 'citizen-1', 'Village Road, Plot 8', 800, 28.6300, 77.2200, 'Compensation', 5, 0],
    ];

    const stmtLand = db.prepare('INSERT INTO lands (id, owner_id, address, area_sqm, latitude, longitude, status, risk_score, delay_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    lands.forEach(l => stmtLand.run(l));
    stmtLand.finalize();

    // 3. Seed Documents
    const docs = [
        ['doc-1', 'LAND-IND-001', 'Aadhar Card', 'Identity', 'https://example.com/aadhar.pdf', 1],
        ['doc-2', 'LAND-IND-001', 'Title Deed', 'Legal', 'https://example.com/deed.pdf', 1],
        ['doc-3', 'LAND-IND-002', 'Survey Map', 'Survey', 'https://example.com/map.pdf', 0], // Not verified
    ];

    const stmtDoc = db.prepare('INSERT INTO documents (id, land_id, title, type, url, verified) VALUES (?, ?, ?, ?, ?, ?)');
    docs.forEach(d => stmtDoc.run(d));
    stmtDoc.finalize();

    // 4. Seed Audit Logs
    db.run("INSERT INTO audit_logs (id, land_id, user_id, action) VALUES (?, ?, ?, ?)", [uuidv4(), 'LAND-IND-001', 'survey-1', 'Survey Completed']);
    
    console.log('Database seeded successfully.');
}

// --- API ROUTES ---

// Auth: Login (Mock OTP)
app.post('/api/auth/login', (req, res) => {
    const { mobile, otp } = req.body;
    db.get('SELECT * FROM users WHERE mobile = ? AND password_or_otp = ?', [mobile, otp], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        
        // Mock token
        res.json({ token: `mock-jwt-${user.id}`, user });
    });
});

// Lands: Get all (Admin/Officer)
app.get('/api/lands', (req, res) => {
    db.all('SELECT lands.*, users.name as owner_name FROM lands JOIN users ON lands.owner_id = users.id', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Lands: Get for specific user (Citizen/Owner)
app.get('/api/lands/user/:userId', (req, res) => {
    db.all('SELECT * FROM lands WHERE owner_id = ?', [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Lands: Get specific land detail with docs and logs
app.get('/api/lands/:id', (req, res) => {
    const landId = req.params.id;
    db.get('SELECT lands.*, users.name as owner_name, users.mobile as owner_mobile FROM lands JOIN users ON lands.owner_id = users.id WHERE lands.id = ?', [landId], (err, land) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!land) return res.status(404).json({ error: 'Land not found' });

        db.all('SELECT * FROM documents WHERE land_id = ?', [landId], (err, docs) => {
            db.all('SELECT audit_logs.*, users.name as user_name FROM audit_logs JOIN users ON audit_logs.user_id = users.id WHERE land_id = ? ORDER BY timestamp DESC', [landId], (err, logs) => {
                res.json({ ...land, documents: docs || [], audit_logs: logs || [] });
            });
        });
    });
});

// Lands: Update Status (Workflow Stepper)
app.put('/api/lands/:id/status', (req, res) => {
    const { status, userId } = req.body;
    const landId = req.params.id;
    
    db.run('UPDATE lands SET status = ? WHERE id = ?', [status, landId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Add audit log
        const logId = uuidv4();
        db.run('INSERT INTO audit_logs (id, land_id, user_id, action) VALUES (?, ?, ?, ?)', 
            [logId, landId, userId, `Status updated to ${status}`]);

        res.json({ success: true, message: 'Status updated' });
    });
});

// Sync Offline Field Data (Mock)
app.post('/api/sync', (req, res) => {
    const { userId, data } = req.body; // data is an array of offline actions
    // For prototype, just log it and return success
    console.log(`Received offline sync from ${userId}:`, data);
    res.json({ success: true, synced_items: data.length });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`BhoomiSetu API running on http://localhost:${PORT}`);
});
