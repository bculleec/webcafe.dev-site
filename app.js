import fastify from 'fastify';
import view from '@fastify/view';
import ejs from 'ejs';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const app = fastify({logger : true});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

app.register(fastifyStatic, {
	root: path.join(__dirname, 'resources')
})

dotenv.config();

app.register(view, {
	root: './views',
	engine: { ejs : ejs }
});

app.get('/', (request, reply) => {
	return reply.view('index', {wsUrl: process.env.WS_URL});
});

app.listen({port: 7070, host: '0.0.0.0'}, (err, address) => {
	if (err) throw err;
});
