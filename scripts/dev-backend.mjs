import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const backendDir = join(rootDir, 'backend');
const venvDir = join(backendDir, '.venv');
const venvPython = process.platform === 'win32'
  ? join(venvDir, 'Scripts', 'python.exe')
  : join(venvDir, 'bin', 'python');
const fallbackPython = process.platform === 'win32' ? 'python' : 'python3';
const python = existsSync(venvPython) ? venvPython : fallbackPython;

const child = spawn(python, ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'], {
  cwd: backendDir,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
