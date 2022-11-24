import { registerWorker } from '../../unified-jobs/mod.ts';


declare module '../../unified-jobs/mod.ts' {
  interface IWorkContext {

    resourceCreate?: {
      // deno-lint-ignore no-explicit-any
      document?: any;
    }

  }
}


registerWorker({
  work: 'resource.user.create',
  handler({ })
});
