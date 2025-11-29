import fastify from 'fastify';
import view from '@fastify/view';
import ejs from 'ejs';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';

const app = fastify({logger : true});

app.register(fastifyStatic, {
	root: '/home/bunny/projects/webcafe.dev-site/resources'
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
