import { ObjectId } from "mongodb";

declare namespace Cloud {
  export interface User {
    _id: ObjectId
    username: string;
    email: string;
    authKey: string;
    secret: string;
    verfied: boolean;
    links?: Record<string, { type: string; email?: string }>
  }
}
