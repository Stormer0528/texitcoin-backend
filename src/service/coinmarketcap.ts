import { Service } from 'typedi';
import axios from 'axios';

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const COINMARKETCAP_API_PREFIX = 'https://pro-api.coinmarketcap.com';
const TEXITCOIN_ID = '32744';

@Service()
export class CoinMarketCapService {
  constructor() {}
  async getLatestPrice() {
    try {
      const res = await axios.get(`${COINMARKETCAP_API_PREFIX}/v1/cryptocurrency/quotes/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
        },
        params: {
          id: TEXITCOIN_ID,
          convert: 'USD',
        },
      });
      return Number(res.data.data[TEXITCOIN_ID].quote.USD.price.toFixed(5));
    } catch (_err) {
      return 0.0;
    }
  }
}
