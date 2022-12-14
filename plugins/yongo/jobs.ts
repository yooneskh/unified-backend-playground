// deno-lint-ignore-file no-explicit-any
import { Query } from "https://deno.land/x/yongo@v1.4.3/mod.ts";
import { registerWorker } from "../../unified-jobs/mod.ts";


declare module '../../unified-jobs/mod.ts' {
  interface IWorkContext {

    yongoList?: {
      collection: string;
      filters?: any;
      sorts?: any;
      selects?: any;
      populates?: any;
      skip?: number;
      limit?: number;
    };

    yongoFind?: {
      collection: string;
      filters?: any;
      selects?: any;
      populates?: any;
    };

    yongoCount?: {
      collection: string;
      filters?: any;
      skip?: number;
      limit?: number;
    };

    yongoRetrieve?: {
      collection: string;
      filters?: any;
      selects?: any;
      populates?: any;
    };

    yongoInsert?: {
      collection: string;
      document: any;
    };

    yongoUpdate?: {
      collection: string;
      filters?: any;
      payload: any;
      multiple?: boolean;
    };

    yongoDelete?: {
      collection: string;
      filters?: any;
      document: any;
      multiple?: boolean;
    };

    yongoItems?: any[];
    yongoItemsCount?: number;
    yongoItem?: any;

  }
}


registerWorker({
  work: 'yongo.list',
  async handler({ yongoList }) {

    if (!yongoList) {
      throw new Error('yongoList not given.');
    }

    const { collection, filters, sorts, selects, populates, skip, limit } = yongoList;

    if (!collection) {
      throw new Error('collection not given.');
    }


    const query = new Query(collection);

    if (filters) {
      query.where(filters);
    }

    if (sorts) {
      query.sort(sorts);
    }

    if (selects) {
      for (const selectKey in selects) {
        if (selects[selectKey] === 1) {
          query.projectIn(selectKey);
        }
        else if (selects[selectKey] === -1) {
          query.projectOut(selectKey);
        }
      }
    }

    if (populates) {
      for (const populate of populates) {
        query.populate(populate);
      }
    }

    if (skip !== undefined) {
      query.skips(skip);
    }

    if (limit !== undefined) {
      query.limits(limit);
    }


    return {
      yongoItems: await query.query(),
    };

  },
});

registerWorker({
  work: 'yongo.count',
  async handler({ yongoCount }) {

    if (!yongoCount) {
      throw new Error('yongoCount not given.');
    }

    const { collection, filters, skip, limit } = yongoCount;

    if (!collection) {
      throw new Error('collection not given.');
    }


    const query = new Query(collection);

    if (filters) {
      query.where(filters);
    }

    if (skip !== undefined) {
      query.skips(skip);
    }

    if (limit !== undefined) {
      query.limits(limit);
    }


    return {
      yongoItemsCount: await query.count(),
    };

  },
});


registerWorker({
  work: 'yongo.find',
  async handler({ yongoFind }) {

    if (!yongoFind) {
      throw new Error('yongoFind not given.');
    }

    const { collection, filters, selects, populates } = yongoFind;

    if (!collection) {
      throw new Error('collection not given.');
    }


    const query = new Query(collection);

    if (filters) {
      query.where(filters);
    }

    if (selects) {
      for (const selectKey in selects) {
        if (selects[selectKey] === 1) {
          query.projectIn(selectKey);
        }
        else if (selects[selectKey] === -1) {
          query.projectOut(selectKey);
        }
      }
    }

    if (populates) {
      for (const populate of populates) {
        query.populate(populate);
      }
    }


    return {
      yongoItem: await query.queryOne(),
    };

  },
});


registerWorker({
  work: 'yongo.retrieve',
  async handler({ yongoRetrieve }) {

    if (!yongoRetrieve) {
      throw new Error('yongoRetrieve not given.');
    }

    const { collection, filters, selects, populates } = yongoRetrieve;

    if (!collection) {
      throw new Error('collection not given.');
    }


    const query = new Query(collection);

    if (filters) {
      query.where(filters);
    }

    if (selects) {
      for (const selectKey in selects) {
        if (selects[selectKey] === 1) {
          query.projectIn(selectKey);
        }
        else if (selects[selectKey] === -1) {
          query.projectOut(selectKey);
        }
      }
    }

    if (populates) {
      for (const populate of populates) {
        query.populate(populate);
      }
    }


    const item = await query.queryOne();

    if (!item) {
      throw new Error('item not found.');
    }


    return {
      yongoItem: item,
    };

  },
});


registerWorker({
  work: 'yongo.insert',
  async handler({ yongoInsert }) {

    if (!yongoInsert) {
      throw new Error('yongoInsert not given.');
    }

    const { collection, document } = yongoInsert;

    if (!collection) {
      throw new Error('collection not given.');
    }


    const query = new Query(collection);

    for (const key in document) {
      query.put(key, document[key]);
    }


    return {
      yongoItem: await query.insert(),
    };

  },
});


registerWorker({
  work: 'yongo.update',
  async handler({ yongoUpdate }) {

    if (!yongoUpdate) {
      throw new Error('yongoUpdate not given.');
    }

    const { collection, filters, payload, multiple } = yongoUpdate;

    if (!collection) {
      throw new Error('collection not given.');
    }


    const query = new Query(collection);

    if (filters) {
      query.where(filters);
    }

    for (const key in payload) {
      query.put(key, payload[key]);
    }

    const result = (multiple) ? (await query.commitMany()) : (await query.commit());


    return {
      yongoItem: await query.insert(),
    };

  },
});
