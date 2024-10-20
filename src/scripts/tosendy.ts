import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import Bluebird from 'bluebird';
import { Client as ElasticClient } from '@elastic/elasticsearch';

import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const SENDY_URL = process.env.SENDY_URL ?? 'https://sendy.blockchainmint.com';
const SENDY_APIKEY = process.env.SENDY_APIKEY;
const SENDY_LISTID = process.env.SENDY_LISTID;
const ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL ?? 'http://127.0.0.1:9200';
const ELASTIC_SENDY_LOG_INDEX = process.env.ELASTIC_SENDY_LOG ?? 'sendylog';

const elastic = new ElasticClient({
  node: ELASTIC_SEARCH_URL,
});

const addSubscribers = async () => {
  console.log('email synchronization is started');
  const members = await prisma.member.findMany();
  await Bluebird.map(
    members,
    async (member, idx: number) => {
      const body = {
        api_key: SENDY_APIKEY,
        email: member.email,
        name: member.fullName,
        list: SENDY_LISTID,
        boolean: 'true',
      };
      const res = await axios.post(`${SENDY_URL}/subscribe`, body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      elastic.index({
        index: ELASTIC_SENDY_LOG_INDEX,
        document: {
          when: new Date().toISOString(),
          api: `${SENDY_URL}/subscribe`,
          apiMethod: 'POST',
          body,
          action: 'SUBSCRIBE',
          result: res.data,
        },
      });

      console.log(`${member.username} - ${member.fullName} - ${member.email} - ${res.data}`);
    },
    { concurrency: 10 }
  );

  console.log('email synchronization is finished');
};

async function sync() {
  console.log('sync is started');
  if (!SENDY_APIKEY || !SENDY_LISTID) {
    console.log('No API KEY or LISTID');
    return;
  }
  await addSubscribers();

  console.log('Finished sync operation');
}

sync();
