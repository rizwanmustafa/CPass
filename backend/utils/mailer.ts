import nodemailer from "nodemailer";
import { google } from "googleapis";
import { GetAccessTokenResponse } from "google-auth-library/build/src/auth/oauth2client";
import Logger from "./logger";

import { MailQueueItem } from "../types/types";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const { CLIENT_ID, CLIENT_SECRET, CLIENT_REDIRECT_URL, CLIENT_REFRESH_TOKEN } = process.env;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, CLIENT_REDIRECT_URL);
oauth2Client.setCredentials({ refresh_token: CLIENT_REFRESH_TOKEN });

const mailQueue: MailQueueItem[] = [];

setInterval(() => {
  if (mailQueue.length === 0) return;

  const mail = mailQueue.shift();
  if (!mail) return;

  sendMail(mail, 1);

}, 0);

const sendMail = async (mailItem: MailQueueItem, tries: number) => {
  mailItem.transport.sendMail(mailItem.mailOpts, (error, info) => {
    if (error) {
      Logger.error(`Sending mail to ${mailItem.mailOpts.to} failed. Try count: ${tries}.`);
      if (tries < 5) {
        Logger.info("Trying again in 5000 milliseconds");
        setTimeout(() => {
          sendMail(mailItem, tries + 1);
        }, 5000);
      }
    };
    console.log(info);

    mailItem.callback(error, info);
  });
  mailItem.transport.close();
};

const createTransport = (accessToken: GetAccessTokenResponse) => {
  const transport = nodemailer.createTransport(new SMTPTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: CLIENT_REFRESH_TOKEN,
      accessToken: accessToken.token ?? ""
    },
    connectionTimeout: 15000,
    socketTimeout: 15000,
  }) as nodemailer.TransportOptions);

  return transport
}

// TODO: Create a queue for emails to send
// TODO: Create a thread for sending emails


export const send2faMail = async (email: string, base32Secret: string, qrCodeSVG: string) => {
  const accessToken = await oauth2Client.getAccessToken();
  const transport = createTransport(accessToken);

  const mailOpts = {
    from: process.env.MAIL_USER as string,
    to: email,
    subject: "CPass 2FA Setup",
    text: `Thanks for registering on CPass.\n
    Please keep the QR code attached secure and use it for 2FA.\n
    It is recommended that you use an app like Google Authenticator for two factor authentication
    You can also use the following secret key: ${base32Secret}\n`.replace(/\n\s+/g, "\n"),
    attachments: [
      { content: qrCodeSVG, filename: "qrcode.svg", contentType: "image/svg+xml", }
    ]
  };

  mailQueue.push({
    transport,
    mailOpts,
    callback: (error, info) => {
      if (error) {
        Logger.error(`Error while sending 2FA email to ${email}`);
        Logger.error(`Error Message: ${error.message} Error Stack: ${error.stack}`);
      }
      if (info)
        Logger.success(`2FA Email sent successfully to ${email}`);
    }
  });

};