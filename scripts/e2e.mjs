// Starts an isolated dev server for end-to-end tests, runs Playwright against it,
// then stops it. Server output goes to <tmpdir>/koral-e2e/dev-server.log.
// IMPORTANT: never write logs or artifacts inside the project directory while the
// dev server runs — its file watcher would recompile and reload pages in a loop.
import { spawn } from 'node:child_process';
import { mkdirSync, openSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const PORT = 3100;
const env = {
  ...process.env,
  DATABASE_URL: process.env.E2E_DATABASE_URL ?? 'postgres://postgres@127.0.0.1:5432/koral_e2e',
  AUTH_DEV_MOCK: 'true',
  STORAGE_DRIVER: 'local',
  APP_SECRET: 'e2e-secret-0123456789abcdef0123456789abcdef',
  NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
  NEXT_PUBLIC_DESCOPE_PROJECT_ID: '',
  RESEND_API_KEY: '',
  // Fresh, isolated build dir per run: a stale Turbopack dev cache caused reload storms.
  NEXT_DIST_DIR: '.next-e2e',
};
rmSync('.next-e2e', { recursive: true, force: true });
const logDir = path.join(tmpdir(), 'koral-e2e');
mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, 'dev-server.log');
const log = openSync(logFile, 'w');
console.log(`[e2e] dev server log: ${logFile}`);
const server = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
  env,
  stdio: ['ignore', log, log],
  detached: true,
});

async function waitForServer() {
  for (let i = 0; i < 180; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/robots.txt`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Dev server did not start; see ${logFile}`);
}

let code = 1;
try {
  await waitForServer();
  code = await new Promise((resolve) => {
    const pw = spawn('npx', ['playwright', 'test', '--trace', 'off', ...process.argv.slice(2)], {
      env: { ...process.env, PW_REUSE_SERVER: '1' },
      stdio: 'inherit',
    });
    pw.on('exit', (c) => resolve(c ?? 1));
  });
} finally {
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    /* already stopped */
  }
}
process.exit(code);
