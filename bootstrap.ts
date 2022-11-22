import { UnifiedWebServer } from './deps.ts';
const app = new UnifiedWebServer();


import './modules/ping/mod.ts';
import { registerPingRoutes } from './modules/ping/routes.ts';
registerPingRoutes(app);

import './modules/authentication/jobs.ts';
import { registerAuthenticationRoutes } from './modules/authentication/routes.ts';
registerAuthenticationRoutes(app);


import { startJobQueue } from './unified-jobs/mod.ts';
startJobQueue();

app.listen({
  port: 8080,
});
