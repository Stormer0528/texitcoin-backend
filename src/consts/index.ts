import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const MEMBERS = ['james', 'CryptoCowboy', 'TXgoldrush', 'lissa', 'stepheb'];

export const USERS = [
  'ac2a2a5a-2ed5-11ef-a85b-00155de6f317',
  'aca8a9d4-2ed5-11ef-82b6-00155de6f317',
];

export const STATISTICS = [
  '34bcb1aa-2d8f-11ef-94f4-00155dcc9782',
  '34f6ec8a-2d8f-11ef-8e57-00155dcc9782',
  '352803ba-2d8f-11ef-81db-00155dcc9782',
  '35479d24-2d8f-11ef-aa85-00155dcc9782',
  'b92a55fe-2e7b-11ef-a50b-00155d2d52ac',
];

export const PAYOUTS = [
  '6f7681f0-9ccf-4a79-b1cb-f87e56cf7e8a',
  'b3ed0e78-6cc8-465c-9454-0576534f06f2',
  'fc6302d9-7819-4cd6-a1a4-68b03286c86f',
  'f8717a04-6203-482a-bed0-58bfb9c6f7e0',
  '69f1351c-e7c8-4c98-9030-2f0469f86b76',
  'ac26f196-d377-4846-8b86-7a7dda622d01',
];

export const PACKAGES = [
  '21e89374-a692-47ee-b493-aacb5f8e7ab1',
  'd9e490b7-1b9f-4774-ae06-ba9eec1000a0',
  '82c93cad-18ec-4fe5-8a36-cf6156dce96c',
  '4b012e68-c6cd-4821-91c9-ef662a0b1790',
  '68d6e036-f687-4db7-9f63-4ed572fe5a93',
  'ea7f50ec-a515-4ba7-a92a-9f0a654226de',
  '2fbd812c-e3a6-4e02-863d-d709323fc0d2',
  'f22628d3-0e9d-4b09-8852-d8d2bed06a10',
  '7e9805d0-f8ff-4edb-81e7-2c56ccd9662b',
  '9d15cac3-3477-464e-9184-cccb073b9006',
  '8ae2bf10-a7f4-40f4-9c7f-ff475948e96e',
  '3da4bf81-5bfe-4f85-8f1d-4eadfe5ddff0',
  'a118d7ef-ab26-4301-bffb-64c7439d2066',
  '96377c3d-aec3-4332-97f5-1315041c3177',
  'aa8604b3-3f2a-4f9c-9ee5-1c9d1d76d726',
  '949e51a5-a05e-4377-9c09-69338ed832ca',
  'eb7a23db-ef66-4775-ab9c-3d7c341361b3',
  'aa4043ca-a950-415a-9497-be8d6687194e',
  '5553932b-b87d-45b0-b459-dad44582348e',
];

export const PAYMENT_METHODS = [
  'fa51399b-ea7f-4a03-9258-2ea85699f710',
  'b94920c9-309d-4d12-b9f8-5065d359b239',
  '0e73ff77-a6ea-44dd-949f-720905f34f2d',
  '2cf180fd-3888-4b8c-956f-dae2e06f5dab',
  '2a7ef882-8923-4c24-9a32-7e930bd8ee91',
  'e1e86e96-a1ec-4ba5-b74e-a7111e18284e',
  '01828920-ea4b-40a1-ac4e-58613b896ade',
  'c5d87c08-4d4c-4243-acc7-466925791501',
];

export const GROUP_SETTINGS = [
  '0d8c0f7a-cd9c-4a95-aa97-4d8d27595166',
  'c63565e9-c321-47a3-8ba8-f2297b30ca36',
];

export const rpc_url = process.env.RPC_URL;
export const rpc_username = process.env.RPC_USERNAME;
export const rpc_password = process.env.RPC_PASSWORD;

export const GET_BLOCK = 'getblock';
export const GET_BLOCK_HASH = 'getblockhash';
export const GET_DIFFICULTY = 'getdifficulty';
export const GET_BLOCK_COUNT = 'getblockcount';
export const GET_NETWORK_HASH_PS = 'getnetworkhashps';

export const DEFAULT_PASSWORD = '123456789';

export const DAILY_BLOCK_LIMIT = 30;
export const WEEKLY_BLOCK_LIMIT = 13;
export const MONTHLY_BLOCK_LIMIT = 12;
export const BLOCK_LIMIT = 200;

export const DAILY_MINER_LIMIT = 20;
export const WEEKLY_MINER_LIMIT = 15;
export const MONTHLY_MINER_LIMIT = 12;
export const QUATER_MINER_LIMIT = 16;

export const DAILY_MINER_REWARD_LIMIT = 20;
export const WEEKLY_MINER_REWARD_LIMIT = 15;
export const MONTHLY_MINER_REWARD_LIMIT = 12;
export const QUATER_MINER_REWARD_LIMIT = 16;

export const WEEKLY_COMMISSION_LIMIT = 15;
export const MONTHLY_COMMISSION_LIMIT = 12;
export const QUATER_COMMISSION_LIMIT = 16;

export const DAILY_STATISTICS_LIMIT = 20;
export const WEEKLY_STATISTICS_LIMIT = 15;
export const MONTHLY_STATISTICS_LIMIT = 12;
export const QUATER_STATISTICS_LIMIT = 16;

export const SPONSOR_BONOUS_CNT = 3;

export const NO_PRODUCT = '916170a2-6b73-450d-9c2a-6ee9cceab30a';

export const PLACEMENT_ROOT = 'affe34e8-891b-41c2-8405-d31df4dadb8c';

export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'upload');
export const PAYMENT_UPLOAD_DIR = path.join(UPLOAD_DIR, 'payment');
export const EMAIL_ATTACHMENT_UPLOAD_DIR = path.join(UPLOAD_DIR, 'email');
export const WEEKLY_REPORT_UPLOAD_DIR = path.join(UPLOAD_DIR, 'weekly_report');

export const COMMISSION_PREVIEW_COMMAND = `cd ${process.cwd()} && ./node_modules/.bin/ts-node -r tsconfig-paths/register src/scripts/weeklyCommission.ts`;
export const GENERATE_WEEKLY_REPORT_COMMAND = `cd ${process.cwd()} && ./node_modules/.bin/ts-node -r tsconfig-paths/register src/scripts/weeklyReport.ts`;

export const GET_MINING_INFO = 'texitcoin-cli getmininginfo';

export const PROFITABILITY_CALCULATION_DAY = '2026-02-28';

export const EXPECTED_HASH_POWER_TREND = [
  200000, 250000, 375000, 562500, 843750, 1265625, 1898438, 2847656, 4271484, 6407227, 9610840,
  14416260, 21624390, 32436584, 48654877, 72982315,
]; //start at Nov, 2024
export const EXPECTED_TXC_COST = 16;

export const REWARD_PER_BLOCK = 254;

export const LIMIT_COMMISSION_L_POINT = 9;
export const LIMIT_COMMISSION_R_POINT = 9;

export const WEEK_START = '2024-03-31';

export const P2P_PAYMENT_METHOD = 'PEER';
export const P2P_TRANSACTION_FEE = 0.05; // 5%
export const COMMISSION_PAYMENT_METHOD = 'COMMISSION';

export const BOGO_COMMISSION_PRODUCT_1 = 'e298ddb2-7984-4b48-971d-b42b746b1b25';
export const BOGO_COMMISSION_PRODUCT_2 = '053fddd3-d390-4943-8e25-523623b72150';
export const BOGO_COMMISSION_PRODUCT_3 = 'fa29870f-a2c5-432f-bc89-0d69aa0623ae';

export const SPONSOR_ROLL_DURATION = 30; //in days

export const INFINITE = Number(1e20);
