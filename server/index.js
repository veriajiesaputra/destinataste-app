import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

import { initializeDatabase } from './scripts/initDb.js';
import { startLocalGemini, stopLocalGemini } from './services/geminiService.js';
import destinationRoutes from './routes/destinationRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/upload', uploadRoutes);

// Root Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DestinaTaste Backend API dengan AI Chatbot Gemini aktif!',
  });
});

// Auto initialize database, start gemini-web2api, and start server
async function startServer() {
  try {
    await initializeDatabase();
    await startLocalGemini();

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      console.log(`📡 Endpoints:`);
      console.log(`   - Chatbot: http://localhost:${PORT}/api/chat`);
      console.log(`   - Auth:    http://localhost:${PORT}/api/auth/login`);
      console.log(`   - Dest:    http://localhost:${PORT}/api/destinations`);
    });
  } catch (error) {
    console.error('❌ Gagal menjalankan server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  stopLocalGemini();
  process.exit(0);
});
process.on('SIGTERM', () => {
  stopLocalGemini();
  process.exit(0);
});

startServer();
