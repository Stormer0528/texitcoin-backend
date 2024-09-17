import { Client } from '@elastic/elasticsearch';

const ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL ?? 'http://127.0.0.1:9200';
const ELASTIC_LOG_INDEX = 'log';

const client = new Client({
  node: ELASTIC_SEARCH_URL,
});

const LogIndexMapping = {
  mappings: {
    properties: {
      who: { type: 'text' },
      when: {
        type: 'date',
        format: 'yyyy-MM-dd hh:mm:ss',
      },
      entity: { type: 'text' },
      action: { type: 'keyword' },
      before: { type: 'object' },
      after: { type: 'object' },
    },
  },
};

// client.index({
//   index: ELASTIC_LOG_INDEX,
//   document: LogIndexMapping,
// });
