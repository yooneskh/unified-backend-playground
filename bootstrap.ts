import './modules/ping/mod.ts';


import { startJobQueue } from './unified-jobs/mod.ts';

startJobQueue();


import { UnifiedWebServer } from './deps.ts';

const app = new UnifiedWebServer();


import { submitJob } from './unified-jobs/mod.ts';

app.route({
  method: 'get',
  path: '/ping',
  async handler() {

    try {
      return Response.json(
        await submitJob({
          works: ['ping'],
        })
      );
    }
    catch (error) {
      return Response.json(error);
    }

  }
});


app.listen({
  port: 8080,
});
