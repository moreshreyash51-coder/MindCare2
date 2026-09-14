import { createApp } from '../artifacts/mindcare/server/app.js';

let appPromise: ReturnType<typeof createApp> | undefined;

export default async function handler(req: any, res: any) {
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