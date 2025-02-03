import { Service } from 'typedi';
import TelegramBot from 'node-telegram-bot-api';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_BOT_CHAT_ID = process.env.TELEGRAM_BOT_CHAT_ID!;

@Service()
export class TelegramBotService {
  private bot = new TelegramBot(TELEGRAM_BOT_TOKEN!);
  constructor() {}

  public async sendMessage(message: string) {
    return this.bot.sendMessage(TELEGRAM_BOT_CHAT_ID, message);
  }

  public async sendNewMinerSignUpNotification(
    username: string,
    fullname: string,
    email: string,
    phone: string,
    pkg: string,
    paymentMethod: string,
    sponsor: string,
    promo: string,
    coinID: string
  ) {
    return this.sendMessage(
      `New miner sign up:
      Username: ${username}
      Fullname: ${fullname}
      Email: ${email}
      Phone: ${phone}
      Package: ${pkg}
      Payment method: ${paymentMethod}
      Sponsor: ${sponsor}
      Promo: ${promo}
      Coin ID: ${coinID}`
    );
  }
}
