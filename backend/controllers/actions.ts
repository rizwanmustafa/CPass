import { Request, Response } from "express";
import { getCollection } from "../db";
import Logger from "../utils/logger";
import { genRandomString } from "../utils/misc";

import { User } from "../types/types"; // Find some way to use types without importing them

// Handle actions
export const handleActions = async (req: Request, res: Response) => {
  const username: string = req.query.username as string;
  const link: string = req.query.link as string;

};

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

    if (!user.links) user.links = {};

    let randomID = genRandomString(32);
    while (user?.links?.[randomID]) {
      randomID = genRandomString(32);
    }

    await usersCollection.updateOne({ username }, {
      $set:
      {
        links: {
          ...user.links,
          [randomID]: { type: "emailVerification", email }
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