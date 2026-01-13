import { config } from './config';
import { handleRoutes } from './routes';

const isProduction = process.env.NODE_ENV === 'production';
const publicDir = isProduction ? './dist' : './public';

const server = Bun.serve({
  port: config.port,
  fetch: handleRoutes
});

console.log(`🚀 Server is running on ${server.url}`);
console.log(`📁 Serving files from: ${publicDir}`);
console.log(`🤖 Available AI services: ${Object.entries(config.services)
  .filter(([_, cfg]) => cfg.enabled)
  .map(([name]) => name)
  .join(', ') || 'None'}`);
if (isProduction) {
  console.log(`⚡ Production mode: Minified assets + Gzip compression enabled`);
}
