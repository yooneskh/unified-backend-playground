import { registerWorker, startJobQueue, submitJob } from './unified-jobs/mod.ts';

startJobQueue();


registerWorker({
  work: 'ping',
  handler() {
    return {
      message: 'pong',
    };
  },
});


import { UnifiedWebServer } from './deps.ts';

const app = new UnifiedWebServer();


app.route({
  method: 'get',
  path: '/ping',
  async handler(_, _context) {

    const result = await submitJob({
      works: ['ping'],
    });

    return Response.json(result);

  }
});


app.listen({
  port: 8080,
});
