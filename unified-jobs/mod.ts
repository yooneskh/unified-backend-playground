import { PatternEventEmitter } from '../deps.ts';


export interface IWorkContext {
  [property: string]: unknown;
}


type TJobStatuses = 'created' | 'activated' | 'hopped' | 'finished' | 'rejected';

export interface IJob {
  _id: string;
  status: TJobStatuses;
  work: string;
  works: string[];
  context: IWorkContext;
  history: { // created and finished or rejected should be in this too
    status: string;
    work: string;
    context: IWorkContext;
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
  handler: (context: IWorkContext) => IWorkContext | Promise<IWorkContext>;
}


const workers: IWorker[] = [];
const jobQueue: IJob[] = [];
const eventEmitter = new PatternEventEmitter(false);


export function registerWorker(worker: IWorker) {
  workers.push({ ...worker });
}


export interface IJobSubmission {
  works: string[];
  context?: IWorkContext;
}

export function submitJob({ works, context }: IJobSubmission): Promise<IWorkContext> {

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


  return new Promise((resolve, reject) => {

    const resolver = (_: string, doneJob: IJob) => {
      eventEmitter.clearCallback(rejecter);
      resolve(doneJob.context);
    };

    const rejecter = (_: string, doneJob: IJob) => {
      eventEmitter.clearCallback(resolver);
      reject(new Error(doneJob.rejectedFor));
    };

    eventEmitter.once(`job.finished.${job._id}`, resolver);
    eventEmitter.once(`job.rejected.${job._id}`, rejecter);

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


  try {

    const wordResultContext = await worker.handler(job.context);

    job.context = Object.assign(job.context, wordResultContext);


    const nextWork = job.works[ job.history.length ];

    if (nextWork) {

      job.status = 'hopped';
      job.work = nextWork;

      jobQueue.push(job);

    }
    else {
      job.status = 'finished';
    }

  }
  catch (error) {
    job.status = 'rejected';
    job.rejectedAt = Date.now();
    job.rejectedFor = error.message;
  }


  job.history.push({
    status: job.status,
    work: job.work,
    context: job.context,
    createdAt: Date.now(),
  });

  eventEmitter.emit(`job.${job.status}.${job._id}`, job);
  processJobQueue();

}


export function startJobQueue() {
  setTimeout(processJobQueue, 0);
}
