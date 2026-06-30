import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = resolve(__dirname, 'templates');

const routeToTemplate = {
  '/home': 'home.html',
  '/search': 'search.html',
  '/create': 'create.html',
  '/chat': 'chat.html',
  '/profile': 'profile.html',
  '/signup': 'signup.html',
};

export default defineConfig({
  root: __dirname,
  plugins: [
    {
      name: 'serve-templates',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0] || '/';
          const templateFile = routeToTemplate[url];
          if (templateFile) {
            const filePath = resolve(templatesDir, templateFile);
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'text/html');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
