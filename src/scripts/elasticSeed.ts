import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';

dotenv.config();

const ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL ?? 'http://127.0.0.1:9200';
const ELASTIC_LOG_INDEX = process.env.ELASTIC_LOG_INDEX ?? 'logtest';

const client = new Client({
  node: ELASTIC_SEARCH_URL,
});

client.indices.create({
  index: ELASTIC_LOG_INDEX,
  mappings: {
    properties: {
      who: { type: 'text' },
      when: { type: 'date' },
      role: { type: 'keyword' },
      entity: { type: 'text' },
      targetId: { type: 'keyword' },
      targetUsername: { type: 'text' },
      action: { type: 'keyword' },
      status: { type: 'keyword' },
      before: { type: 'object' },
      after: { type: 'object' },
    },
  },
});
