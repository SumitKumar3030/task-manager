const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check routes
app.get('/', (req, res) => {
  res.send('Hello world');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});


// Routes will be mounted here later, e.g.:
// app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));

module.exports = app;