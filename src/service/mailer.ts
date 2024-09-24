import path from 'path';
import { Service } from 'typedi';
import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import { isEmail } from 'class-validator';

interface SMTPConnectionAuth {
  user: string;
  pass: string;
}

const SMTP_HOST: string = process.env.SMTP_HOST ?? 'localhost';
const SMTP_PORT: number = +process.env.SMTP_PORT ?? 1025;
const SMTP_SECURE: boolean = JSON.parse(process.env.SMTP_SECURE);
const SMTP_AUTH: SMTPConnectionAuth = {
  user: process.env.SMTP_USERNAME,
  pass: process.env.SMTP_PASSWORD,
};
const SMTP_SENDER_EMAIL: string = process.env.SMTP_SENDER_EMAIL;
const SMTP_SENDER_NAME: string = process.env.SMTP_SENDER_NAME;

@Service()
export class MailerService {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: SMTP_AUTH,
      tls: {
        ciphers: 'SSLv3',
      },
    });

    // Attach the handlebars plugin to nodemailer
    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          partialsDir: path.resolve(__dirname, '../../templates/'), // Path to templates directory
          defaultLayout: false,
        },
        viewPath: path.resolve(__dirname, '../../templates/'),
        extName: '.hbs',
      })
    );
  }

  public async sendMail(mailOption: SendMailOptions) {
    return this.transporter.sendMail(mailOption);
  }

  public async sendForgetpasswordLink(to: string, name: string, resetLink: string) {
    if (isEmail(to) && isEmail(SMTP_SENDER_EMAIL)) {
      const mailOption = {
        from: `"${SMTP_SENDER_NAME}" <${SMTP_SENDER_EMAIL}>`,
        to,
        subject: 'Reset Your Password',
        template: 'resetpassword',
        context: {
          name,
          resetLink,
        },
      };
      const sentMailInfo = await this.sendMail(mailOption);
      console.log(
        `Email was sent to ${to}, Type => Reset Password, Message ID => ${sentMailInfo.messageId}`
      );
    }
  }

  public async sendEmailVerificationCode(to: string, name: string, code: string) {
    if (isEmail(to) && isEmail(SMTP_SENDER_EMAIL)) {
      const mailOption = {
        from: `"${SMTP_SENDER_NAME}" <${SMTP_SENDER_EMAIL}>`,
        to,
        subject: 'Email Verification',
        template: 'emailverify',
        context: {
          name,
          verificationCode: code,
        },
      };
      const sentMailInfo = await this.sendMail(mailOption);
      console.log(
        `Email was sent to ${to}, Type => Email Verification Code, Message ID => ${sentMailInfo.messageId}`
      );
    }
  }

  public async sendEmailVerificationLink(to: string, name: string, link: string) {
    if (isEmail(to) && isEmail(SMTP_SENDER_EMAIL)) {
      const mailOption = {
        from: `"${SMTP_SENDER_NAME}" <${SMTP_SENDER_EMAIL}>`,
        to,
        subject: 'Email Verification',
        template: 'emailverifylink',
        context: {
          name,
          verificationLink: link,
        },
      };
      const sentMailInfo = await this.sendMail(mailOption);
      console.log(
        `Email was sent to ${to}, Type => Email Verification Link, Message ID => ${sentMailInfo.messageId}`
      );
    }
  }
}
