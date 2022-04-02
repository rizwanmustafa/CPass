import { Request, Response } from "express";
import { getCollection } from "../db";
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

