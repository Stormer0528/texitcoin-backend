import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';

dotenv.config();

const ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL ?? 'http://127.0.0.1:9200';
const ELASTIC_LOG_INDEX = process.env.ELASTIC_LOG_INDEX ?? 'logtest';
const ELASTIC_SHELL_LOG_INDEX = process.env.ELASTIC_SHELL_LOG ?? 'shelllogtest';
const ELASTIC_SENDY_LOG_INDEX = process.env.ELASTIC_SENDY_LOG ?? 'sendylog';

const client = new Client({
  node: ELASTIC_SEARCH_URL,
});

// client.indices.create({
//   index: ELASTIC_LOG_INDEX,
//   mappings: {
//     properties: {
//       who: { type: 'text' },
//       when: { type: 'date' },
//       role: { type: 'keyword' },
//       entity: { type: 'text' },
//       targetId: { type: 'keyword' },
//       targetUsername: { type: 'text' },
//       action: { type: 'keyword' },
//       status: { type: 'keyword' },
//       before: { type: 'object' },
//       after: { type: 'object' },
//     },
//   },
// });

// client.indices.create({
//   index: ELASTIC_SHELL_LOG_INDEX,
//   mappings: {
//     properties: {
//       when: { type: 'date' },
//       command: { type: 'keyword' },
//       subcommand: { type: 'keyword' },
//       fullCommand: { type: 'text' },
//       extra: { type: 'object' },
//       result: { type: 'text' },
//       error: { type: 'text' },
//       status: { type: 'keyword' },
//     },
//   },
// });

client.indices.create({
  index: ELASTIC_SENDY_LOG_INDEX,
  mappings: {
    properties: {
      when: { type: 'date' },
      apiMethod: { type: 'keyword' },
      api: { type: 'text' },
      body: { type: 'text' },
      action: { type: 'keyword' },
      result: { type: 'text' },
    },
  },
});
