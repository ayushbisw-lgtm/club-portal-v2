const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const GitHubSync = require('./github_sync');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Configuration for persistent storage
const DATA_DIR = process.env.DATABASE_PATH ? path.dirname(process.env.DATABASE_PATH) : __dirname;
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.db');
const projectsPath = process.env.PROJECTS_JSON_PATH || 'projects.json';
const messagesPath = process.env.MESSAGES_JSON_PATH || 'messages.json';
const uploadsDir = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Database setup
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS team (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        password TEXT,
        approved INTEGER DEFAULT 0
    )`);
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// JSON file helpers
const getJsonData = (file) => {
    const filePath = path.isAbsolute(file) ? file : path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const saveJsonData = (file, data) => {
    const filePath = path.isAbsolute(file) ? file : path.join(DATA_DIR, file);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
};

// --- API ROUTES ---

// Projects API
app.get('/api/projects', (req, res) => {
    res.json(getJsonData(projectsPath));
});

app.post('/api/projects', (req, res) => {
    const projects = getJsonData(projectsPath);
    const newProject = {
        id: Date.now(),
        ...req.body
    };
    projects.push(newProject);
    saveJsonData(projectsPath, projects);
    res.json({ success: true, project: newProject });
});

app.delete('/api/projects/:id', (req, res) => {
    let projects = getJsonData(projectsPath);
    const initialLength = projects.length;
    projects = projects.filter(p => String(p.id) !== String(req.params.id));
    if (projects.length < initialLength) {
        saveJsonData(projectsPath, projects);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Project not found' });
    }
});


// Team API (SQLite)
app.get('/api/team', (req, res) => {
    db.all("SELECT * FROM team", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json(rows);
    });
});

app.post('/api/team', (req, res) => {
    const { name, role, password } = req.body;
    if (!name || !role) return res.status(400).json({ success: false, message: 'Name and role are required' });
    
    // Default password if not provided
    const defaultPassword = (name.split(' ')[0] || 'User') + '123';
    const finalPassword = password || defaultPassword;

    db.run("INSERT INTO team (name, role, password, approved) VALUES (?, ?, ?, 0)", 
        [name, role, finalPassword], 
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.patch('/api/team/approve/:id', (req, res) => {
    db.run("UPDATE team SET approved = 1 WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/team/:id', (req, res) => {
    db.run("DELETE FROM team WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
});

// Messages API
app.get('/api/messages', (req, res) => {
    res.json(getJsonData(messagesPath));
});

app.post('/api/messages', (req, res) => {
    const messages = getJsonData(messagesPath);
    const newMessage = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...req.body
    };
    messages.push(newMessage);
    saveJsonData(messagesPath, messages);
    res.json({ success: true, message: newMessage });
});

// File Upload API
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
});

// GitHub Sync API
app.post('/api/sync', async (req, res) => {
    try {
        const sync = new GitHubSync();
        const essentialFiles = [
            "server.js", "package.json", "index.html",
            "team.html", "database.html", "script.js", "style.css",
            "background.js", "manifest.json", "service-worker.js",
            "team-script.js", "logo.jpg", "database.db",
            "projects.json", "team.json", "messages.json"
        ];
        const results = await sync.syncAll(essentialFiles);
        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Serve uploads folder
app.use('/uploads', express.static(uploadsDir));

// Fallback for SPA (if needed)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
