import { Service } from 'typedi';

import { Client } from '@elastic/elasticsearch';
import { Username } from '@elastic/elasticsearch/lib/api/types';

const ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL ?? 'http://127.0.0.1:9200';
const ELASTIC_LOG_INDEX = 'log';

export type ELASTIC_LOG_TYPE = 'create' | 'update' | 'remove';
export type ELASTIC_LOG_OWNER_ROLE = 'admin' | 'miner';
export type ELASTIC_LOG_ACTION_STATUS = 'success' | 'failed';

@Service()
export class ElasticSearchService {
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      node: ELASTIC_SEARCH_URL,
    });
  }
  async addLog(
    who: string,
    role: ELASTIC_LOG_OWNER_ROLE,
    entity: string,
    target: string,
    action: ELASTIC_LOG_TYPE,
    status: ELASTIC_LOG_ACTION_STATUS,
    after: any,
    before: any
  ) {
    try {
      await this.client.index({
        index: ELASTIC_LOG_INDEX,
        document: {
          who,
          role,
          when: new Date().toISOString(),
          entity,
          target,
          action,
          status,
          before,
          after,
        },
      });
    } catch (_err) {
      console.log('Elastic Error => ', _err.message);
    }
  }
  async getLogByMinerUsername(username: string, limit: number) {
    return this.client
      .search({
        query: {
          match: {
            target: username,
          },
        },
        sort: {
          when: 'desc',
        },
        size: limit,
      })
      .catch(() => null);
  }
}
