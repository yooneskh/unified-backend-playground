import { registerWorker } from '../../unified-jobs/mod.ts';


declare module '../../unified-jobs/mod.ts' {
  interface IWorkContext {
    pong?: number;
  }
}


registerWorker({
  work: 'ping',
  handler() {
    return {
      pong: Date.now(),
    };
  }
});
