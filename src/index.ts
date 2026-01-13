import { config } from './config';
import { handleRoutes } from './routes';

const server = Bun.serve({
  port: config.port,
  fetch: handleRoutes
});

console.log(`🚀 Server is running on ${server.url}`);
console.log(`📁 Serving files from: ./public`);
console.log(`🤖 Available AI services: ${Object.entries(config.services)
  .filter(([_, cfg]) => cfg.enabled)
  .map(([name]) => name)
  .join(', ') || 'None'}`);
