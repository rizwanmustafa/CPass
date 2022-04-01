import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

export interface User {
  _id: ObjectId
  username: string;
  email: string;
  authKey: string;
  secret: string;
  verfied: boolean;
  actions?: UserAction[];
}

export interface UserAction { type: string; link: string; used: boolean; email?: string }

export interface MailCallback { (error: Error | null, info: any): any; }
export interface MailQueueItem {
  transport: nodemailer.Transporter;
  mailOpts: nodemailer.SendMailOptions;
  callback: MailCallback;
}
