import { UnifiedWebServer } from './unified-web-server.ts';


const app = new UnifiedWebServer();


app.route({
  method: 'get',
  path: '/hello',
  handler: () => new Response('Hello World!'),
});

app.route({
  method: 'get',
  path: '/bye',
  handler: () => new Response('Bye World!'),
});

app.route({
  method: 'get',
  path: '/hello/:name',
  handler: (_, context) => new Response(`Hello World ${context.params['name']}!`),
});

app.route({
  method: 'post',
  path: '/hello/:name',
  handler: (_, context) => Response.json(context),
});


app.listen({
  port: 8080,
});
