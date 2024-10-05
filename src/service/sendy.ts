import { Service } from 'typedi';

const SENDY_URL = process.env.SENDY_URL ?? 'https://sendy.blockchainmint.com';

@Service()
export class SendyService {
  constructor() {}
  async removeSubscriber(email: string) {
    //
  }
  async addSubscriber(email: string) {
    //
  }
}
