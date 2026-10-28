import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const reactRouterServe = path.resolve(projectDirectory, 'node_modules/@react-router/serve/bin.cjs');
const buildDirectory = path.resolve(projectDirectory, 'dist/apps/web/server/index.js');
const port = process.env.PORT || '3000';

const child = spawn(process.execPath, [reactRouterServe, buildDirectory, '--host', '0.0.0.0', '--port', port], {
	stdio: 'inherit',
});

child.on('exit', (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 1);
});
