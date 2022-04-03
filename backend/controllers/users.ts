import { Request, Response } from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import bcrypt from "bcrypt";
import { sign as JwtSign } from "jsonwebtoken";

import { getCollection } from "../db";
import { sendSignUpMail } from "../utils/mailer";
import Logger from "../utils/logger";

import { User } from "../types/types";
import { createEmailVerificationAction } from "./actions";
import { isUsernameUsed, isEmailUsed, createDefUserObj } from "../utils/misc";

// Controller functions
export const createUser = async (req: Request, res: Response) => {
  try {
    const email = req.body.email as string;
    const username = req.body.username as string;
    const authKey = req.body.authKey as string;
    const newAuthKey = await bcrypt.hash(authKey, 10);

    if (await isUsernameUsed(username)) return res.status(400).json({ message: "Username already in use" });
    if (await isEmailUsed(email)) return res.status(400).json({ message: "Email already in use" });

    const usersCollection = await getCollection("users");

    const userSecret = speakeasy.generateSecret({ name: `CPass ${email}` });
    const qrCode = await qrcode.toString(userSecret.otpauth_url as string, { type: "svg" });

    const userObject = createDefUserObj(username, email, newAuthKey, userSecret.base32);
    await usersCollection.insertOne(userObject);

    const actionID = await createEmailVerificationAction(username, email, userObject);
    // TODO: Think about removing the user from the database if the action fails
    if (actionID === "") return res.status(500).json({ message: "Internal Server Error" });

    const verificationLink = `${process.env.BASE_URL}/users/actions?username=${username}&link=${actionID}`;
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

    const usersCollection = await getCollection("users");

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
};

export const usernameAvailable = async (req: Request, res: Response) => {
  try {
    const usernameAvailable = !(await isUsernameUsed(req.query.username as string));
    return res.json({ usernameAvailable: usernameAvailable }); // TODO: Later create and follow a set response format
  }
  catch (e) {
    Logger.error("Error while checking if username is used");
    Logger.error(e);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const authenticateUser = async (req: Request, res: Response) => {
  try {

    const username = req.body.username as string;
    const authKey = req.body.authKey as string;
    const totpCode = req.body.totpCode as string;

    const usersCollection = await getCollection("users");

    const user: User = await usersCollection.findOne({ username }) as User;

    if (!user) return res.status(404).json({ message: "User not found" });

    const authCodeMatches = await bcrypt.compare(authKey, user.authKey);
    const totpCodeMatches = speakeasy.totp.verify({ secret: user.secret, encoding: "base32", token: totpCode });

    const jwt = JwtSign({ username: user.username }, process.env.JWT_SECRET as string, { expiresIn: 15 * 60 * 1000 });
    if (authCodeMatches && totpCodeMatches)
      return res.status(200).json({ message: "You are authenticated", data: { jwt } });
    else return res.status(401).json({ message: "You are not authenticated" }); // TODO: Send a login attempt email and in future lock account if too many attempts
  }
  catch (e) {
    Logger.error("Error while authenticating user");
    Logger.error(e);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};