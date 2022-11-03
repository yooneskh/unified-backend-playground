import { PatternEventEmitter } from '../deps.ts';


type SObject = Record<string, unknown>;


type TJobStatuses = 'created' | 'activated' | 'hopped' | 'finished' | 'rejected';

export interface IJob {
  _id: string;
  status: TJobStatuses;
  work: string;
  works: string[];
  context: SObject;
  history: { // created and finished or rejected should be in this too
    status: string;
    work: string;
    context: SObject;
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
  job: IJob;
}


const eventEmitter = new PatternEventEmitter(false);


export interface IWorker {
  work: string;
  handler: (context: SObject) => SObject | Promise<SObject>;
}

const workers: IWorker[] = [];
const jobQueue: IJob[] = [];


export function registerWorker(worker: IWorker) {
  workers.push({ ...worker });
}



export interface IJobSubmission {
  works: string[];
  context: SObject;
  onFinish: (job: IJob) => void | Promise<void>;
}

export function submitJob({ works, context }: IJobSubmission): Promise<SObject> {

  const initialWork = works[0];


  const job: IJob = {
    _id: String(Math.random()),
    status: 'created',
    work: initialWork,
    works,
    context,
    history: [
      {
        status: 'created',
        work: initialWork,
        context,
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  };

  jobQueue.push(job);


  return new Promise(resolve => {
    eventEmitter.once(`job.finished.${job._id}`, (_, finishedJob: IJob) => {
      if (finishedJob._id === job._id) {
        resolve(finishedJob.context);
      }
    })
  });

}


async function processJobQueue() {

  console.log('processing job queue at', new Date().getMinutes(), new Date().getSeconds());

  const job = jobQueue.shift();

  if (!job) {
    return setTimeout(processJobQueue, 5000);
  }


  const worker = workers.find(it => it.work === job.work);

  if (!worker) {
    setTimeout(processJobQueue, 5000);
    throw new Error(`no worker for this job work ${job.work}`);
  }


  job.status = 'activated';

  const context = await worker.handler(job.context);


  job.context = context;


  const nextWork = job.works[ job.history.length ];

  if (nextWork) {

    job.status = 'hopped';
    job.work = nextWork;

    jobQueue.push(job);

  }
  else {
    job.status = 'finished';
  }


  job.history.push({
    status: job.status,
    work: job.work,
    context,
    createdAt: Date.now(),
  });

  eventEmitter.emit(`job.${job.status}.${job._id}`, job)


  setTimeout(processJobQueue, 5000);

}


export function startJobQueue() {
  setTimeout(processJobQueue, 0);
}
