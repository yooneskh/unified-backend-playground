import { registerWorker, startJobQueue, submitJob } from './unified-jobs/mod.ts';

startJobQueue();


registerWorker({
  work: 'say-hello',
  handler(context) {

    console.log(`hello ${context.name}`, context);

    return {
      ...context,
      hello: `hello ${context.name}`,
    };

  },
});

registerWorker({
  work: 'say-bye',
  handler(context) {

    console.log(`bye ${context.name}`, context);

    return {
      ...context,
      bye: `bye ${context.name}`,
    };

  },
});


import { UnifiedWebServer } from './deps.ts';

const app = new UnifiedWebServer();


app.route({
  method: 'post',
  path: '/hello/:name',
  handler: (_, context) => Response.json(context),
});

app.route({
  method: 'get',
  path: '/hello/:name',
  async handler(_, context) {

    const result = await submitJob({
      works: ['say-hello', 'say-bye'],
      context: {
        name: context.params['name'],
      },
      onFinish(job) {
        console.log('job was finished', job);
      }
    });

    return Response.json(result);

  }
});


app.listen({
  port: 8080,
});
