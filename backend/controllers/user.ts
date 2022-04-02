import { Request, Response } from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

import { getCollection } from "../db";
import { sendSignUpMail } from "../utils/mailer";
import Logger from "../utils/logger";

import { User } from "../types/types";
import { createEmailVerificationAction } from "../utils/actions";
import { usernameUsed, emailUsed } from "../utils/misc";


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
    if (!usersCollection) {
      Logger.error("Database - Failed to get users collection");
      return res.status(500).json({ message: "Internal Server Error" });
    }

    const userSecret = speakeasy.generateSecret({ name: `CPass ${email}` });
    const qrCode = await qrcode.toString(userSecret.otpauth_url as string, { type: "svg" });

    await usersCollection.insertOne({ email, username, authKey, secret: userSecret.base32, emailVerified: false });
    const actionID = await createEmailVerificationAction(username, email);
    if (actionID === "") return res.status(500).json({ message: "Internal Server Error" });

    const verificationLink = `${process.env.BASE_URL}/actions?username=${username}&link=${actionID}`;
    if (process.env.MODE === "dev") console.log(verificationLink);
    sendSignUpMail(email, userSecret.base32, qrCode, verificationLink);


    return res.status(200).json({ message: "Account created" });
  }
  catch (e) {
    Logger.error("Error while creating a user");
    Logger.error(e);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const username: string = req.body.username;

    const usersCollection = getCollection("users");
    if (!usersCollection) {
      Logger.error("Database - Failed to get users collection");
      return res.status(500).json({ message: "Internal Server Error" });
    }

    const user: User = await usersCollection.findOne({ username }) as User;

    if (!user) return res.status(404).json({ message: "User not found" });

    usersCollection.deleteOne({ _id: user._id });

    return res.status(200).json({ message: "User deleted" });
  }
  catch (e) {
    Logger.error("Error while deleting a user");
    Logger.error(e);

    return res.status(500).json({ message: "Internal Server Error" });
  }
}