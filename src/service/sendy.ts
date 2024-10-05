import { Service } from 'typedi';
import axios from 'axios';

const SENDY_URL = process.env.SENDY_URL ?? 'https://sendy.blockchainmint.com';
const SENDY_APIKEY = process.env.SENDY_APIKEY;
const SENDY_LISTID = process.env.SENDY_LISTID ?? 'dev';

@Service()
export class SendyService {
  constructor() {}
  async removeSubscriber(email: string) {
    await axios.post(`${SENDY_URL}/api/subscribers/delete.php`, {
      api_key: SENDY_APIKEY,
      email,
      list: SENDY_LISTID,
    });
  }
  async addSubscriber(email: string, name: string) {
    await axios.post(`${SENDY_URL}/subscribe`, {
      api_key: SENDY_APIKEY,
      email,
      name,
      list: SENDY_LISTID,
    });
  }
}
