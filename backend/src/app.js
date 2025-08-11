require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('WhatsApp Clone Backend Running');
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import and use routes
const messageRoutes = require('./routes/messages');
app.use('/api', (req, res, next) => {
  req.io = io;
  next();
}, messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Socket.IO setup (for bonus task)
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = {
  app,
  io,
};
