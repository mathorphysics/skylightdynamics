import express from 'express';
import { createRequestHandler } from '@react-router/express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const app = express();

app.disable('x-powered-by');
app.use('/assets', express.static(path.join(projectDirectory, 'dist/apps/web/client/assets'), {
	immutable: true,
	maxAge: '1y',
}));
app.use(express.static(path.join(projectDirectory, 'dist/apps/web/client')));
app.use(createRequestHandler({
	build: () => import('./dist/apps/web/server/index.js'),
	mode: process.env.NODE_ENV || 'production',
}));

app.listen(port, '0.0.0.0', () => {
	console.log(`React Router server listening on port ${port}`);
});
