

export interface IWork {
  stage: 'initiated' | 'finished' | 'rejected' | string;
  context: Record<string, unknown>;
  history: { // initiated and finished should be in this too
    stage: string;
    context: Record<string, unknown>;
    createdAt: number;
  }[];
  finished?: boolean;
  finishedAt?: number;
  rejected?: boolean;
  rejectedAt?: number;
  rejectedFor?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface IWorkerContext {
  work: IWork;
}


export async function registerWorker(stage: string, handler: (context: IWorkerContext) => Promise<void>) {

}


export async function submitWork(stage: string, initialContext: Record<string, unknown>, onFinish: (work: IWork) => Promise<void>) {

  // create work

  // EventHandler.once('work.finished', (work) => {
  //   if (work.id === createdWork.id) onFinish(work);
  // })

}