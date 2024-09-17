import { Service } from 'typedi';

import { Client } from '@elastic/elasticsearch';

const ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL ?? 'http://127.0.0.1:9200';
const ELASTIC_LOG_INDEX = 'log';

export type ELASTIC_LOG_TYPE = 'create' | 'update' | 'delete';

@Service()
export class ElasticSearchService {
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      node: ELASTIC_SEARCH_URL,
    });
  }
  addLog(who: string, entity: string, action: ELASTIC_LOG_TYPE, after: string, before?: string) {
    this.client.index({
      index: ELASTIC_LOG_INDEX,
      document: {
        who,
        when: new Date(),
        entity,
        action,
        before,
        after,
      },
    });
  }
}
