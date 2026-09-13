import type { Request, Response } from 'express';
import { createApp } from '../server/app.js';

let appPromise: ReturnType<typeof createApp> | undefined;

export default async function handler(req: Request, res: Response) {
  try {
    appPromise ??= createApp();
    const app = await appPromise;
    app(req, res);
  } catch (error) {
    res.status(500).json({
      error: 'MindCare API failed to initialize',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}