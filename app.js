import fastify from 'fastify';
import view from '@fastify/view';
import ejs from 'ejs';

const app = fastify({logger : true});

app.register(view, {
	root: './views',
	engine: { ejs : ejs }
});

app.get('/', (request, reply) => {
	return reply.view('index');
});

app.listen({port: 7070, host: '0.0.0.0'}, (err, address) => {
	if (err) throw err;
});
