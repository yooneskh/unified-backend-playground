import { UnifiedRouter } from '../../deps.ts';
import { submitJob } from '../../unified-jobs/mod.ts';


export function registerPingRoutes(router: UnifiedRouter) {

  router.get({
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
        return new Response(error.message, { status: 400 });
      }

    }
  });

}
