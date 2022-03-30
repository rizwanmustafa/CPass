import { Request, Response } from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

import { getCollection } from "../db";
import { send2faMail } from "../utils/mailer";
import Logger from "../utils/logger";

// Utility functions

const usernameUsed = async (username: string): Promise<boolean> => {
  const usersCollection = getCollection("users");
  if (!usersCollection) return false;

  const user = await usersCollection.findOne({ username });
  return !!user;
}

const emailUsed = async (email: string): Promise<boolean> => {
  const usersCollection = getCollection("users");
  if (!usersCollection) return false;

  const user = await usersCollection.findOne({ email });
  return !!user;
}

// Controller functions
export const createUser = async (req: Request, res: Response) => {
  try {

    type UserData = {
      email: string,
      username: string,
      authKey: string
    };

    const { email, username, authKey }: UserData = req.body;

    if (await usernameUsed(username)) return res.status(400).json({ message: "Username already in use" });
    if (await emailUsed(email)) return res.status(400).json({ message: "Email already in use" });

    const usersCollection = getCollection("users");

    if (!usersCollection) return res.status(500).json({ message: "Internal Server Error" }); // TODO: Later use a custom logger as well

    const userSecret = speakeasy.generateSecret({ name: `CloudPass ${email}` });

    const qrCode = await qrcode.toString(userSecret.otpauth_url as string, { type: "svg" });

    // TODO: Send a link to first verify their email address
    // TODO: Upon verification the user will be sent the 2FA email
    await send2faMail(email, userSecret.base32, qrCode);

    usersCollection.insertOne({ email, username, authKey, secret: userSecret.base32, verified: false });

    return res.status(200).json({ message: "Account created" });
  }
  catch (e) {
    Logger.error("There was an error while creating a user");
    Logger.error(e);
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  const { username }: { username: string } = req.body;

  const usersCollection = getCollection("users");
  if (!usersCollection) return res.status(500).json({ message: "Internal Server Error" }); // TODO: Later use a custom logger as well

  const user = await usersCollection.findOne({ username });

  if (!user) return res.status(404).json({ message: "User not found" });

  usersCollection.deleteOne({ _id: user._id });

  return res.status(200).json({ message: "User deleted" });
}