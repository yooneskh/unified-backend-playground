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

export interface IWorker {
  work: string;
  handler: (context: SObject) => SObject | Promise<SObject>;
}


const workers: IWorker[] = [];
const jobQueue: IJob[] = [];
const eventEmitter = new PatternEventEmitter(false);


export function registerWorker(worker: IWorker) {
  workers.push({ ...worker });
}


export interface IJobSubmission {
  works: string[];
  context?: SObject;
}

export function submitJob({ works, context }: IJobSubmission): Promise<SObject> {

  const job: IJob = {
    _id: String(Math.random()).slice(3),
    status: 'created',
    work: works[0],
    works,
    context: context ?? {},
    history: [
      {
        status: 'created',
        work: works[0],
        context: context ?? {},
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  };


  jobQueue.push(job);


  return new Promise(resolve => {

    eventEmitter.once(`job.finished.${job._id}`, (_, finishedJob: IJob) => {
      resolve(finishedJob.context);
    });

    processJobQueue();

  });

}


function processJobQueue() {

  const job = jobQueue.shift();

  if (!job) {
    return;
  }


  job.status = 'activated';

  processJob(job);

}

async function processJob(job: IJob) {

  const worker = workers.find(it => it.work === job.work);

  if (!worker) {

    job.status = 'rejected';
    job.rejectedAt = Date.now();
    job.rejectedFor = `No worker for this work ${job.work}`;

    job.history.push({
      status: job.status,
      work: job.work,
      context: job.context,
      createdAt: Date.now(),
    });

    return;

  }


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

  eventEmitter.emit(`job.${job.status}.${job._id}`, job);
  processJobQueue();

}


export function startJobQueue() {
  setTimeout(processJobQueue, 0);
}
