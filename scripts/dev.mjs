import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const processes = [
  ['backend', 'node', [join('scripts', 'dev-backend.mjs')]],
  ['frontend', 'npm', ['--prefix', 'frontend', 'run', 'dev']],
];

const children = processes.map(([name, command, args]) => {
  const executable = process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command;
  const child = spawn(executable, args, {
    cwd: rootDir,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${name} exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
});

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
