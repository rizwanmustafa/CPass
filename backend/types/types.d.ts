import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

export interface User {
  _id: ObjectId
  username: string;
  email: string;
  authKey: string;
  secret: string;
  verfied: boolean;
  actions: UserAction[];
  settings: UserSettings;
}

export interface UserAction { type: string; link: string; used: boolean; email?: string }

export interface UserSettings { tokenExpDuration: number}

export interface MailCallback { (error: Error | null, info: any): any; }
export interface MailQueueItem {
  transport: nodemailer.Transporter;
  mailOpts: nodemailer.SendMailOptions;
  callback: MailCallback;
}
