import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tasks', taskRoutes);

// Simple link proxy to allow embedding some pages in an iframe from this domain
app.get('/api/proxy-link', async (req, res, next) => {
  try {
    const target = req.query.url;
    if (!target || typeof target !== 'string') {
      return res.status(400).send('Missing url parameter');
    }

    // Basic safety: only allow http/https URLs
    if (!/^https?:\/\//i.test(target)) {
      return res.status(400).send('Invalid url');
    }

    const response = await fetch(target);
    const contentType = response.headers.get('content-type') || 'text/html; charset=utf-8';
    const body = await response.text();

    res.setHeader('Content-Type', contentType.startsWith('text/') ? contentType : 'text/html; charset=utf-8');
    // Do not forward X-Frame-Options or similar headers so this response can be framed
    res.send(body);
  } catch (err) {
    console.error('Proxy link error:', err);
    next(err);
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'DailyForge API is running' });
});

// Global error handler fallback
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
