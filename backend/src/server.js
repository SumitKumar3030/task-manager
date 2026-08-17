require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('join-project', (projectId) => {
    socket.join(projectId);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(projectId);
  });
});

// Make io accessible inside controllers via req.app.get('io')
app.set('io', io);

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();