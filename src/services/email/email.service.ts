import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
const SendGrid = require('@sendgrid/mail');

@Injectable()
export class EmailService {
  constructor() {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async send(mailInfo: {
    subject: string;
    text: string;
    receiver: string;
  }): Promise<void> {
    const mail: MailDataRequired = {
      from: {
        name: 'Kingsgate Support',
        //TODO
        email: 'tianyi.legal@tianyitech.co',
      },

      to: mailInfo.receiver,
      subject: mailInfo.subject,
      text: ' ', // plain text body
      html: mailInfo.text, // html body
    };
    try {
      await SendGrid.send(mail);
    } catch (error) {
      console.error('Error while sending email', error);
      throw error;
    }
  }
}
