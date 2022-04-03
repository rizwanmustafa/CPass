import { Request, Response } from "express";
import { getCollection } from "../db";
import { genRandomString } from "../utils/misc";
import Logger from "../utils/logger";

import { User, UserAction } from "../types/types";
import { Collection, Document } from "mongodb";
import { userActionSchema } from "../schemas/users";

// Handle actions
export const handleActions = async (req: Request, res: Response) => {
  const username: string = req.query.username as string;
  const link: string = req.query.link as string;

  const usersCollection = await getCollection("users");
  if (!usersCollection) {
    Logger.error("Database - Failed to get users collection");
    return false;
  }

  const user: User = await usersCollection.findOne({ username }) as User;
  if (!user) {
    Logger.warning("User actions handling - User not found");
    return res.status(400).json({ message: "User not found" });
  }

  const action = user.actions?.find(a => a.link === link);

  if (!user.actions || !action) {
    Logger.warning("User actions handling - Given link does not exist on user");
    return res.status(400).json({ message: "Given link does not exist on user" });
  }

  if (action.type === "emailVerification")
    return handleEmailVerificationAction(user, link, action, usersCollection, res);
  else {
    Logger.error("Unknown action type");
    return res.status(500).json({ message: "Internal Server Error" });
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
  try {
    if (action.used) return res.json({ message: "Action has expired" });

    if (user.email === action.email) {
      const actionIndex = user.actions?.findIndex(a => a.link === actionID);
      if (actionIndex === -1) { return res.status(400).json({ message: "Action not found" }); }

      await userCollection.updateOne(
        { username: user.username },
        {
          $set: {
            [`actions.${actionIndex}.used`]: true,
            "emailVerified": true
          }
        }
      );
      return res.status(200).json({ message: "Email verified!" });
    }
    else {
      Logger.error("Email verification action used on wrong email");
      return res.status(500).json({ message: "Internal Server Error" });
    }

  }
  catch (e) {
    Logger.error("Error while handling email verification action");
    Logger.error(e);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createEmailVerificationAction = async (username: string, email: string, userObject?: User): Promise<string> => {
  try {
    const usersCollection = await getCollection("users");

    if (!userObject) {
      userObject = await usersCollection.findOne({ username }) as User;
      if (!userObject) {
        Logger.error("Create email verification action called on non-existent user");
        return "";
      }
    }

    let actionID = genRandomString(32);
    while (userObject.actions.find(a => a.link === actionID)) {
      actionID = genRandomString(32);
    }

    const emailAction: UserAction = {
      type: "emailVerification",
      used: false,
      link: actionID,
      email,
    };

    await usersCollection.updateOne({ username }, { $push: { actions: emailAction } });

    return actionID;
  }
  catch (e) {
    Logger.error("Error while creating email verification action");
    Logger.error(e);

    return "";
  }
};