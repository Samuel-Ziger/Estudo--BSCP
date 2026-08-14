const fs = require('fs');
const path = require('path');

function readJsonBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;

    function fail(error) {
      if (settled) return;
      settled = true;
      reject(error);
    }

    req.on('data', chunk => {
      size += chunk.length;
      if (size <= limit) chunks.push(chunk);
    });
    req.on('end', () => {
      if (settled) return;
      if (size > limit) {
        const error = new Error(`Corpo da requisição excede ${Math.floor(limit / 1024)} KB`);
        error.statusCode = 413;
        return fail(error);
      }
      try {
        settled = true;
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        const error = new Error('Corpo JSON inválido');
        error.statusCode = 400;
        fail(error);
      }
    });
    req.on('error', fail);
  });
}

function resolvePublicFile(publicDirectory, pathname) {
  const target = pathname === '/' ? '/index.html' : pathname;
  const relative = path.normalize(target).replace(/^([/\\]*\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  const publicRoot = path.resolve(publicDirectory);
  const full = path.resolve(publicRoot, relative);
  if (!full.startsWith(`${publicRoot}${path.sep}`) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) return null;
  return full;
}

module.exports = { readJsonBody, resolvePublicFile };
