import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3002', 10);
const DIST_DIR = path.resolve(__dirname, 'dist');
const BACKEND_TARGET = process.env.BACKEND_TARGET || process.env.VITE_API_TARGET || 'https://api-lms.smkalazharsempu.sch.id';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
};

// Comprehensive Defense-in-Depth Security Headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss: ws:",
    "frame-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join('; '),
};

function proxyRequest(req, res, targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    const isHttps = parsed.protocol === 'https:';
    const client = isHttps ? https : http;
    const defaultPort = isHttps ? 443 : 80;

    const clientIp = req.socket.remoteAddress || '';
    const existingXff = req.headers['x-forwarded-for'];
    const xff = existingXff ? `${existingXff}, ${clientIp}` : clientIp;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : defaultPort,
      path: req.url,
      method: req.method,
      timeout: 30000,
      headers: {
        ...req.headers,
        host: parsed.host,
        'x-forwarded-for': xff,
        'x-forwarded-proto': req.headers['x-forwarded-proto'] || (isHttps ? 'https' : 'http'),
      },
    };

    const proxyReq = client.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, {
        ...proxyRes.headers,
        ...SECURITY_HEADERS,
      });
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      if (!res.headersSent) {
        res.writeHead(504, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
        res.end(JSON.stringify({ error: 'Backend gateway timeout' }));
      }
    });

    proxyReq.on('error', (err) => {
      console.error(`[Proxy Error] ${req.method} ${req.url}:`, err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
        res.end(JSON.stringify({ error: 'Backend gateway connection failed' }));
      }
    });

    req.pipe(proxyReq, { end: true });
  } catch (err) {
    console.error(`[Proxy Error Exception] ${req.method} ${req.url}:`, err.message);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
      res.end(JSON.stringify({ error: 'Internal proxy configuration error' }));
    }
  }
}

const server = http.createServer((req, res) => {
  // 1. Proxy API & Upload requests to backend
  if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
    return proxyRequest(req, res, BACKEND_TARGET);
  }

  // 2. Serve static SPA files with strict Path Traversal & Null-Byte Protection
  let safePath = '';
  try {
    const rawPath = req.url.split('?')[0];
    if (rawPath.includes('\0') || rawPath.includes('%00')) {
      res.writeHead(400, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      return res.end('400 Bad Request: Invalid Characters');
    }
    safePath = decodeURIComponent(rawPath);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
    return res.end('400 Bad Request: Malformed URI');
  }

  // If root requested, serve index.html
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.resolve(DIST_DIR, safePath.replace(/^\/+/, ''));

  // Strict Canonical Path Boundary Enforcement
  const relativeFromDist = path.relative(DIST_DIR, filePath);
  if (relativeFromDist.startsWith('..') || path.isAbsolute(relativeFromDist)) {
    res.writeHead(403, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
    return res.end('403 Forbidden: Directory traversal blocked');
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const isImmutable = safePath.startsWith('/assets/');

      const headers = {
        'Content-Type': contentType,
        ...SECURITY_HEADERS,
        'Cache-Control': isImmutable
          ? 'public, max-age=31536000, immutable'
          : 'no-cache, no-store, must-revalidate',
      };

      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA Fallback: Serve index.html for unknown routes
      const indexPath = path.resolve(DIST_DIR, 'index.html');
      fs.readFile(indexPath, (indexErr, content) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
          res.end('404 - LMS Web build not found. Please run npm run build.');
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            ...SECURITY_HEADERS,
          });
          res.end(content);
        }
      });
    }
  });
});

// WebSocket Upgrade Proxying
server.on('upgrade', (req, socket, head) => {
  try {
    const parsed = new URL(BACKEND_TARGET);
    const isHttps = parsed.protocol === 'https:';
    const targetPort = parsed.port ? parseInt(parsed.port, 10) : (isHttps ? 443 : 80);

    const clientIp = req.socket.remoteAddress || '';
    const existingXff = req.headers['x-forwarded-for'];
    const xff = existingXff ? `${existingXff}, ${clientIp}` : clientIp;

    const proxyOptions = {
      hostname: parsed.hostname,
      port: targetPort,
      path: req.url,
      method: 'GET',
      headers: {
        ...req.headers,
        host: parsed.host,
        'x-forwarded-for': xff,
        'x-forwarded-proto': isHttps ? 'https' : 'http',
      },
    };

    const client = isHttps ? https : http;
    const proxyReq = client.request(proxyOptions);

    proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
      socket.write(
        `HTTP/${proxyRes.httpVersion} ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n` +
        Object.entries(proxyRes.headers)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}\r\n`)
          .join('') +
        '\r\n'
      );

      if (proxyHead && proxyHead.length > 0) {
        socket.write(proxyHead);
      }
      if (head && head.length > 0) {
        proxySocket.write(head);
      }

      proxySocket.pipe(socket);
      socket.pipe(proxySocket);
    });

    proxyReq.on('error', (err) => {
      console.error('[WS Proxy Error]:', err.message);
      socket.destroy();
    });

    proxyReq.end();
  } catch (err) {
    console.error('[WS Upgrade Exception]:', err.message);
    socket.destroy();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`LMS Web Production Server listening on http://0.0.0.0:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
