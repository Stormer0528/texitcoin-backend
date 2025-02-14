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
const SMTP_PORT: number = +(process.env.SMTP_PORT ?? 1025);
const SMTP_SECURE: boolean = process.env.SMTP_SECURE?.toLowerCase() === 'true';
const SMTP_AUTH: SMTPConnectionAuth = {
  user: process.env.SMTP_USERNAME,
  pass: process.env.SMTP_PASSWORD,
};
const SMTP_SENDER_EMAIL: string = process.env.SMTP_SENDER_EMAIL;
const SMTP_SENDER_NAME: string = process.env.SMTP_SENDER_NAME;
const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL;

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
          partialsDir: path.resolve(process.cwd(), 'templates'), // Path to templates directory
          defaultLayout: false,
        },
        viewPath: path.resolve(process.cwd(), 'templates'),
        extName: '.hbs',
      })
    );
  }

  public async sendMail(mailOption: SendMailOptions) {
    return this.transporter.sendMail(mailOption);
  }

  public async sendForgetPasswordLink(to: string, name: string, resetLink: string) {
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

  public async sendEmailVerificationCode(to: string, name: string, code: string, link: string) {
    if (isEmail(to) && isEmail(SMTP_SENDER_EMAIL)) {
      const mailOption = {
        from: `"${SMTP_SENDER_NAME}" <${SMTP_SENDER_EMAIL}>`,
        to,
        subject: 'Email Verification',
        template: 'emailverify',
        context: {
          name,
          verificationCode: code,
          verificationLink: link,
        },
      };
      const sentMailInfo = await this.sendMail(mailOption);
      console.log(
        `Email was sent to ${to}, Type => Email Verification Code, Message ID => ${sentMailInfo.messageId}`
      );
    }
  }

  public async notifyMinerSignupToAdmin(
    minerEmail: string,
    minerFullname: string,
    sponsorName: string | null
  ) {
    if (isEmail(ADMIN_EMAIL) && isEmail(SMTP_SENDER_EMAIL)) {
      const mailOption = {
        from: `"${SMTP_SENDER_NAME}" <${SMTP_SENDER_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: 'New Miner Sign-Up Notification',
        template: 'signupnotification',
        context: {
          signupName: minerFullname,
          signupEmail: minerEmail,
          referenceMember: sponsorName || 'No Reference',
        },
      };
      const sentMailInfo = await this.sendMail(mailOption);
      console.log(
        `Email was sent to ${ADMIN_EMAIL}, Type => New Miner Sign-Up Notification, Message ID => ${sentMailInfo.messageId}`
      );
    }
  }

  public async notifyMiner3rdIntroducersToAdmin(
    minerUsername: string,
    minerFullname: string,
    totalIntroducers: number,
    bonusType: string,
    bonusGroup: string
  ) {
    if (isEmail(ADMIN_EMAIL) && isEmail(SMTP_SENDER_EMAIL)) {
      const mailOption = {
        from: `"${SMTP_SENDER_NAME}" <${SMTP_SENDER_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: 'Miner Reached Third Introducer Notification',
        template: 'sponsornotification',
        context: {
          minerName: minerFullname,
          minerUsername: minerUsername,
          totalIntroducers,
          saleType: bonusType,
          bonusGroup,
        },
      };
      const sentMailInfo = await this.sendMail(mailOption);
      console.log(
        `Email was sent to ${ADMIN_EMAIL}, Type => Miner Reached Third Introducer Notification, Message ID => ${sentMailInfo.messageId}`
      );
    }
  }

  public async sendToSignUpConfirmation(to: string, fullName: string) {
    if (isEmail(to) && isEmail(SMTP_SENDER_EMAIL)) {
      const mailOption = {
        from: `"${SMTP_SENDER_NAME}" <${SMTP_SENDER_EMAIL}>`,
        to,
        subject: 'Welcome to Texitcoin',
        template: 'signupsuccess',
        context: {
          fullName,
        },
      };
      const sentMailInfo = await this.sendMail(mailOption);
      console.log(
        `Email was sent to ${ADMIN_EMAIL}, Type => Welcome to Texitcoin - Registration Confirmation, Message ID => ${sentMailInfo.messageId}`
      );
    }
  }

  public async sendWelcomeEmail(to: string) {
    if (isEmail(to) && isEmail(SMTP_SENDER_EMAIL)) {
      const mailOption0 = {
        from: `"${SMTP_SENDER_NAME}" <${SMTP_SENDER_EMAIL}>`,
        to,
        subject: 'Welcome to Texitcoin: Your Account is Approved and Ready!',
        template: 'welcome0',
        context: {},
      };
      const sentMailInfo0 = await this.sendMail(mailOption0);
      console.log(
        `Email was sent to ${to}, Type => Welcome to Texitcoin - Your Account is Approved and Ready!, Message ID => ${sentMailInfo0.messageId}`
      );

      const mailOption1 = {
        from: `"${SMTP_SENDER_NAME}" <${SMTP_SENDER_EMAIL}>`,
        to,
        subject: 'Welcome to Texitcoin: Your Texitcoin Adventure Begins',
        template: 'welcome1',
        context: {},
      };
      const sentMailInfo1 = await this.sendMail(mailOption1);
      console.log(
        `Email was sent to ${to}, Type => Welcome to Texitcoin - Your Texitcoin Adventure Begins, Message ID => ${sentMailInfo1.messageId}`
      );
    }
  }

  public async contactToAdmin(fullName: string, email: string, message: string | null) {
    if (isEmail(ADMIN_EMAIL) && isEmail(SMTP_SENDER_EMAIL)) {
      const mailOption = {
        from: `"${SMTP_SENDER_NAME}" <${SMTP_SENDER_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: 'New Contact Request',
        template: 'contacted',
        context: {
          fullName,
          email,
          message,
        },
      };
      const sentMailInfo = await this.sendMail(mailOption);
      console.log(
        `Email was sent to ${ADMIN_EMAIL}, Type => New Contact Request, Message ID => ${sentMailInfo.messageId}`
      );
    }
  }
}
