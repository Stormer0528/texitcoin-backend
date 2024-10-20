import { Inject, Service } from 'typedi';
import axios from 'axios';
import { ElasticSearchService } from './elasticsearch';

const SENDY_URL = process.env.SENDY_URL ?? 'https://sendy.blockchainmint.com';
const SENDY_APIKEY = process.env.SENDY_APIKEY;
const SENDY_LISTID = process.env.SENDY_LISTID;

@Service()
export class SendyService {
  constructor(
    @Inject(() => ElasticSearchService)
    private readonly elasticService: ElasticSearchService
  ) {}
  async removeSubscriber(email: string) {
    if (!SENDY_APIKEY || !SENDY_LISTID) {
      console.log('No API KEY or LISTID');
      return;
    }
    const body = {
      api_key: SENDY_APIKEY,
      email,
      list_id: SENDY_LISTID,
    };
    const res = await axios.post(`${SENDY_URL}/api/subscribers/delete.php`, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    this.elasticService.addSendyLog(
      `${SENDY_URL}/api/subscribers/delete.php`,
      'POST',
      body,
      'DELETE',
      res.data
    );
  }
  async addSubscriber(email: string, name: string) {
    if (!SENDY_APIKEY || !SENDY_LISTID) {
      console.log('No API KEY or LISTID');
      return;
    }
    const body = {
      api_key: SENDY_APIKEY,
      email,
      name,
      list: SENDY_LISTID,
      boolean: 'true',
    };
    const res = await axios.post(`${SENDY_URL}/subscribe`, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    this.elasticService.addSendyLog(`${SENDY_URL}/subscribe`, 'POST', body, 'SUBSCRIBE', res.data);
  }
}
