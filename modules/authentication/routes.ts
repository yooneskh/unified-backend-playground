import { UnifiedRouter } from '../../deps.ts';
import { submitJob } from '../../unified-jobs/mod.ts';


export function registerAuthenticationRoutes(router: UnifiedRouter) {

  router.post({
    path: '/authentication/login',
    async handler(_, context) {

      try {

        const result = await submitJob({
          works: ['authentication.login'],
          context: {
            authenticationLogin: {
              provider: 'password',
              providerIdentifier: context.body.providerIdentifier,
              providerValidator: context.body.providerValidator,
            }
          }
        });


        return Response.json({
          token: result.authenticationToken,
        });

      }
      catch (error) {
        return new Response(error.message, { status: 400 });
      }

    }
  });

}
