import { PatternEventEmitter } from '../deps.ts';


type TWorkStages = 'fresh' | 'active' | 'waiting' | 'finished' | 'rejected';

export interface IWork {
  _id: string;
  stage: TWorkStages;
  type: string;
  context: Record<string, unknown>;
  history: { // fresh and finished should be in this too
    stage: string;
    type: string;
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


const _eventEmitter = new PatternEventEmitter(false);

const workers: { type: string, handler: (context: IWorkerContext) => Promise<{ stage: TWorkStages, type: string; context: Record<string, unknown>}>}[] = [];
const workQueue: IWork[] = [];


// deno-lint-ignore require-await
export async function registerWorker(type: string, handler: (context: IWorkerContext) => Promise<{ stage: TWorkStages, type: string; context: Record<string, unknown>}>) {

  workers.push({ type, handler });

  // todo: create a DAG of workers !!!!!!!!!!!

}


// deno-lint-ignore require-await no-unused-vars
export async function submitWork(type: string, initialContext: Record<string, unknown>, onFinish: (work: IWork) => Promise<void>) {

  const work: IWork = {
    _id: String(Math.random()),
    stage: 'fresh',
    type,
    context: initialContext,
    history: [
      {
        stage: 'fresh',
        type,
        context: initialContext,
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  };

  // EventHandler.once('work.finished', (work) => {
  //   if (work.id === createdWork.id) onFinish(work);
  // })

  workQueue.push(work);

}


async function processWorkQueue() {

  const work = workQueue.shift();

  if (!work) {
    return setTimeout(processWorkQueue, 3000);
  }


  const worker = workers.find(it => it.type === work.type);

  if (!worker) {
    throw new Error('no worker for this work type ${}');
  }


  work.stage = 'active';


  const { stage, type, context } = await worker.handler({
    work,
  });


  work.stage = stage;
  work.type = type;
  work.context = context;

  work.history.push({
    stage,
    type,
    context,
    createdAt: Date.now(),
  });


}
