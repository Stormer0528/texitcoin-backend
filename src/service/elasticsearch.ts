import { Service } from 'typedi';

import { Client } from '@elastic/elasticsearch';

const ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL ?? 'http://127.0.0.1:9200';
const ELASTIC_LOG_INDEX = process.env.ELASTIC_LOG_INDEX ?? 'logtest';
const ELASTIC_SENDY_LOG_INDEX = process.env.ELASTIC_SENDY_LOG ?? 'sendylog';

export type ELASTIC_LOG_TYPE = 'create' | 'update' | 'remove' | 'signup';
export type ELASTIC_LOG_OWNER_ROLE = 'admin' | 'miner';
export type ELASTIC_LOG_ACTION_STATUS = 'success' | 'failed';
export type ELASTIC_LOG_API_METHOD = 'POST' | 'GET' | 'DELETE' | 'PUT';
export type ELASTIC_LOG_SENDY_ACTION = 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'DELETE';

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
    targetId: string,
    targetUsername: string,
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
          targetId,
          targetUsername,
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
  async getLogByMinerId(id: string, limit: number) {
    return this.client
      .search({
        index: ELASTIC_LOG_INDEX,
        query: {
          term: {
            'targetId.keyword': {
              value: id,
            },
          },
        },
        sort: {
          when: 'desc',
        },
        size: limit,
      })
      .catch(() => null);
  }

  async addSendyLog(
    api: string,
    apiMethod: ELASTIC_LOG_API_METHOD,
    body: any,
    action: ELASTIC_LOG_SENDY_ACTION,
    result: string
  ) {
    try {
      await this.client.index({
        index: ELASTIC_SENDY_LOG_INDEX,
        document: {
          when: new Date().toISOString(),
          api,
          apiMethod,
          body,
          action,
          result,
        },
      });
    } catch (_err) {
      console.log('Elastic Error => ', _err.message);
    }
  }
}
