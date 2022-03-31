import { Request, Response } from "express";
import { getCollection } from "../db";
import { genRandomString } from "../utils/misc";
import Logger from "../utils/logger";

import { User, UserAction } from "../types/types"; // Find some way to use types without importing them
import { Collection, Document } from "mongodb";

// Handle actions
export const handleActions = async (req: Request, res: Response) => {
  const username: string = req.query.username as string;
  const link: string = req.query.link as string;

  const usersCollection = getCollection("users");
  if (!usersCollection) {
    Logger.error("Database - Failed to get users collection");
    return false;
  }

  const user: User = await usersCollection.findOne({ username }) as User;
  if (!user) {
    Logger.warning("User actions handling - User not found");
    return res.status(400).json({ message: "User not found" });
  }

  if (!user.actions || !user.actions[link]) {
    Logger.warning("User actions handling - Given link does not exist on user");
    return res.status(400).json({ message: "Given link does not exist on user" });
  }

  const linkData = user.actions[link];

  if (linkData.type === "emailVerification")
    return handleEmailVerificationAction(user, link, linkData, usersCollection, res);
  else{
    Logger.error("Unknown action type");
    return res.status(400).json({ message: "Unknown action type" });
  }

};



// Handle custom actions
export const handleEmailVerificationAction = async (
  user: User,
  actionID: string,
  action: UserAction,
  userCollection: Collection<Document>,
  res: Response
) => {
  if (action.used) return;

  try {
    if (user.email === action.email)
      await userCollection.updateOne({ username: user.username }, { $set: { [`actions.${actionID}.used`]: true, "emailVerified": true } });
    else
      Logger.warning("User actions handling - Email verification action used on wrong email");

    return res.status(200).json({ message: "Email verification action used successfully" });
  }
  catch (e) {
    Logger.error(`User actions handling - Error while handling email verification action`);
    if (e instanceof Error) Logger.error(`Error Message: ${e.message}\nError Stack: ${e.stack}`);
    else Logger.error(e)

    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Create actions
export const createEmailVerificationAction = async (username: string, email: string): Promise<boolean> => {
  try {
    const usersCollection = getCollection("users");
    if (!usersCollection) {
      Logger.error("Database - Failed to get users collection");
      return false;
    }

    const user: User = await usersCollection.findOne({ username }) as User;
    if (!user) {
      Logger.error("Create email verification action called on non-existent user");
      return false;
    }

    if (!user.actions) user.actions = {};

    let randomID = genRandomString(32);
    while (user?.actions?.[randomID]) {
      randomID = genRandomString(32);
    }

    await usersCollection.updateOne({ username }, {
      $set:
      {
        actions: {
          ...user.actions,
          [randomID]: { type: "emailVerification", email, used: false }
        }
      }
    });

    return true;
  }
  catch (e) {
    if (e instanceof Error) Logger.error(e.message);
    else Logger.error(e);

    return false;
  }
};