import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import Bluebird from 'bluebird';

import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const SENDY_URL = process.env.SENDY_URL ?? 'https://sendy.blockchainmint.com';
const SENDY_APIKEY = process.env.SENDY_APIKEY;
const SENDY_LISTID = process.env.SENDY_LISTID;

const addSubscribers = async () => {
  console.log('email synchronization is started');
  const members = await prisma.member.findMany();
  await Bluebird.map(
    members,
    async (member, idx: number) => {
      const res = await axios.post(
        `${SENDY_URL}/subscribe`,
        {
          api_key: SENDY_APIKEY,
          email: member.email,
          name: member.fullName,
          list: SENDY_LISTID,
          boolean: 'true',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
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
