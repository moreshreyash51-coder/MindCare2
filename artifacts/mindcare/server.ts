import 'dotenv/config';
import { createDevelopmentApp } from './server/app.js';

async function main() {
  const port = Number(process.env.PORT) || 3000;
  const app = await createDevelopmentApp();

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`MindCare is running at http://localhost:${port}`);
    console.log(`API health: http://localhost:${port}/api/health`);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('MindCare failed to start:', error);
  process.exit(1);
});