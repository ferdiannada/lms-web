import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_TARGET || env.BACKEND_URL || 'https://api-lms.smkalazharsempu.sch.id';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3002,
      host: true,
      allowedHosts: ['lms-web.test'],
      hmr: {
        host: 'localhost',
        port: 3002,
      },
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              proxyReq.setHeader('Origin', target as string);
              proxyReq.setHeader('Referer', `${target}/`);
            });
          },
        },
        '/uploads': {
          target,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});

