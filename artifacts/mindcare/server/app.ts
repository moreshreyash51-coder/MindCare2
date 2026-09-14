import express, { type Express } from 'express';
import path from 'node:path';
import { aiRouter } from './routes/ai.js';
import { authRouter } from './routes/auth.js';
import { gamesRouter } from './routes/games.js';
import { memoriesRouter } from './routes/memories.js';
import { notificationsRouter } from './routes/notifications.js';
import { patientsRouter } from './routes/patients.js';
import { remindersRouter } from './routes/reminders.js';
import { getDatabaseStatus, initDatabase } from './db/schema.js';

let databaseReady: Promise<void> | undefined;

async function ensureDatabase() {
  databaseReady ??= initDatabase().then(() => undefined);
  await databaseReady;
}

export async function createApp(options: { serveFrontend?: boolean } = {}): Promise<Express> {
  const app = express();
  const serveFrontend = options.serveFrontend ?? false;

  await ensureDatabase();

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'MindCare API',
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  app.get('/api/db/status', async (_req, res) => {
    try {
      res.json(await getDatabaseStatus());
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve database status',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.use('/api/auth', authRouter);
  app.use('/api/patients', patientsRouter);
  app.use('/api/memories', memoriesRouter);
  app.use('/api/games', gamesRouter);
  app.use('/api/reminders', remindersRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/notifications', notificationsRouter);

  // Vercel may invoke a catch-all function with the /api prefix removed.
  // These mounts keep the same API routes working in both invocation modes.
  if (process.env.VERCEL) {
    app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        service: 'MindCare API',
        timestamp: new Date().toISOString(),
        aiConfigured: Boolean(process.env.GEMINI_API_KEY),
        environment: process.env.NODE_ENV || 'development',
      });
    });
    app.get('/db/status', async (_req, res) => {
      try {
        res.json(await getDatabaseStatus());
      } catch (error) {
        res.status(500).json({
          error: 'Failed to retrieve database status',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
    app.use('/auth', authRouter);
    app.use('/patients', patientsRouter);
    app.use('/memories', memoriesRouter);
    app.use('/games', gamesRouter);
    app.use('/reminders', remindersRouter);
    app.use('/ai', aiRouter);
    app.use('/notifications', notificationsRouter);
  }

  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  if (serveFrontend) {
    const projectRoot = process.cwd();
    const publicPath = path.join(projectRoot, 'dist', 'public');
    app.use(express.static(publicPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  return app;
}

export async function createDevelopmentApp() {
  const app = express();
  await ensureDatabase();
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'MindCare API',
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      environment: process.env.NODE_ENV || 'development',
    });
  });
  app.get('/api/db/status', async (_req, res) => {
    try {
      res.json(await getDatabaseStatus());
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve database status' });
    }
  });
  app.use('/api/auth', authRouter);
  app.use('/api/patients', patientsRouter);
  app.use('/api/memories', memoriesRouter);
  app.use('/api/games', gamesRouter);
  app.use('/api/reminders', remindersRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/notifications', notificationsRouter);
  app.get('/mindcare-api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'MindCare API',
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      environment: process.env.NODE_ENV || 'development',
    });
  });
  app.get('/mindcare-api/db/status', async (_req, res) => {
    try {
      res.json(await getDatabaseStatus());
    } catch {
      res.status(500).json({ error: 'Failed to retrieve database status' });
    }
  });
  app.use('/mindcare-api/auth', authRouter);
  app.use('/mindcare-api/patients', patientsRouter);
  app.use('/mindcare-api/memories', memoriesRouter);
  app.use('/mindcare-api/games', gamesRouter);
  app.use('/mindcare-api/reminders', remindersRouter);
  app.use('/mindcare-api/ai', aiRouter);
  app.use('/mindcare-api/notifications', notificationsRouter);
  app.all('/api/*', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));
  app.all('/mindcare-api/*', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: process.cwd(),
    });
    app.use(vite.middlewares);
  } else {
    const projectRoot = process.cwd();
    const publicPath = path.join(projectRoot, 'dist', 'public');
    app.use(express.static(publicPath));
    app.get('*', (_req, res) => res.sendFile(path.join(publicPath, 'index.html')));
  }

  return app;
}