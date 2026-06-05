import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const backendDir = join(rootDir, 'backend');
const venvDir = join(backendDir, '.venv');
const pythonLauncher = process.platform === 'win32' ? 'python' : 'python3';
const venvPython = process.platform === 'win32'
  ? join(venvDir, 'Scripts', 'python.exe')
  : join(venvDir, 'bin', 'python');

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(venvDir)) {
  run(pythonLauncher, ['-m', 'venv', venvDir], backendDir);
}

run(venvPython, ['-m', 'pip', 'install', '--upgrade', 'pip'], backendDir);
run(venvPython, ['-m', 'pip', 'install', '-r', 'requirements.txt'], backendDir);

const backendEnv = join(backendDir, '.env');
if (!existsSync(backendEnv)) {
  copyFileSync(join(backendDir, '.env.example'), backendEnv);
}

console.log('\nBackend setup complete. Add your GEMINI_API_KEY in backend/.env when you need AI features.');
