import { registerWorker } from '../../unified-jobs/mod.ts';


declare module '../../unified-jobs/mod.ts' {
  interface IWorkContext {

    authenticationLogin?: {
      provider: 'password';
      providerIdentifier: string;
      providerValidator?: string;
    };

    authenticationRegister?: {
      provider: string;
      providerIdentifier: string;
      providerValidator?: string;
      information: Record<string, string>;
    };

    authenticationVerify?: {
      verificationIdentifier: string;
      verificationValidator: string;
    };

    authenticationToken?: string;

  }
}


registerWorker({
  work: 'authentication.login',
  handler({ authenticationLogin }) {

    if (!authenticationLogin) {
      throw new Error(' authenticationLogin context not provided.');
    }

    const { provider, providerIdentifier, providerValidator } = authenticationLogin;

    if (!provider || !providerIdentifier) {
      throw new Error('provider or providerIdentifier not given.');
    }


    if (provider !== 'password') {
      throw new Error('only password provider is supported now.')
    }

    if (!providerValidator) {
      throw new Error('providerValidator not given.');
    }


    if (providerIdentifier !== '123' || providerValidator !== '123') {
      throw new Error('identifier or validator is wrong.');
    }


    return {
      authenticationToken: '123',
    };

  }
});
