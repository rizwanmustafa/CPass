import nodemailer from "nodemailer";
import { google } from "googleapis";
import { GetAccessTokenResponse } from "google-auth-library/build/src/auth/oauth2client";
import Logger from "./logger";

import { MailQueueItem } from "../types/types";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const { CLIENT_ID, CLIENT_SECRET, CLIENT_REDIRECT_URI, CLIENT_REFRESH_TOKEN } = process.env;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, CLIENT_REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: CLIENT_REFRESH_TOKEN });

const mailQueue: MailQueueItem[] = [];

setInterval(() => {
  if (mailQueue.length === 0) return;

  const mail = mailQueue.shift();
  if (!mail) return;

  sendMail(mail, 1);

}, 0);

const sendMail = async (mailItem: MailQueueItem, tries: number) => {
  try {
    Logger.info(`Trying to send mail to ${mailItem.mailOpts.to}`);
    mailItem.transport.sendMail(mailItem.mailOpts, (error, info) => {
      if (error) {
        Logger.error(`Sending mail to ${mailItem.mailOpts.to} failed. Try count: ${tries}.`);
        if (tries < 5) {
          Logger.info("Trying again in 5000 milliseconds");
          setTimeout(() => {
            sendMail(mailItem, tries + 1);
          }, 5000);
        }
      }
      else {
        mailItem.transport.close();
      }
      mailItem.callback(error, info);
    });
  }
  catch (e) {
    Logger.error("There was some error while sending mail!");
    Logger.error(e);
  }
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

  return transport;
};

export const sendSignUpMail = async (email: string, base32Secret: string, qrCodeSVG: string, verficationLink: string) => {
  try {

    const accessToken = await oauth2Client.getAccessToken();
    const transport = createTransport(accessToken);

    const mailOpts = {
      from: process.env.MAIL_USER as string,
      to: email,
      subject: "CPass 2FA Setup",
      text: `Thanks for registering on CPass.
      Please click on the following link to verify your email address: ${verficationLink}
      You can use the QR code attached or the following secret key for 2FA:
      Secret Key: ${base32Secret}
      It is recommended that you use an app like Google Authenticator for two factor authentication
      `.replace(/\n\s+/g, "\n"),
      attachments: [
        { content: qrCodeSVG, filename: "qrcode.svg", contentType: "image/svg+xml", }
      ]
    };

    mailQueue.push({
      transport,
      mailOpts,
      callback: (error, info) => {
        if (error) {
          Logger.error(`Error while sending 2FA mail to ${email}`);
          Logger.error(`Error Message: ${error.message}\nError Stack: ${error.stack}`);
        }
        if (info)
          Logger.success(`2FA mail sent successfully to ${email}`);
      }
    });
  }
  catch (e) {
    Logger.error("There was an error while sending mail!");
    Logger.error(e);
  }
};


export const sendLoginAttemptMail = async (email: string, ipAddress: string, successful: boolean) => {
  try {

    const accessToken = await oauth2Client.getAccessToken();
    const transport = createTransport(accessToken);

    const mailOpts = {
      from: process.env.MAIL_USER as string,
      to: email,
      subject: `CPass ${successful ? "Successful" : "Failed"} Login attempt`,
      text: `Hi there,
    A ${successful ? "successful" : "failed"} login attempt to your account has taken place.
    IP Address of login attempt: ${ipAddress}
    If you did not initiate this login attempt, please contact the CPass support.`.replace(/\n\s+/g, "\n")
    };

    mailQueue.push({
      transport,
      mailOpts,
      callback: (error, info) => {
        if (error) {
          Logger.error(`Error while sending login attempt mail to ${email}`);
          Logger.error(`Error Message: ${error.message}\nError Stack: ${error.stack}`);
        }
        if (info)
          Logger.success(`Login attempt mail sent successfully to ${email}`);
      }
    });
  }
  catch (e) {
    Logger.error("There was an error while sending mail!");
    Logger.error(e);
  }
};