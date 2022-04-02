import { getCollection } from "../db";
import { genRandomString } from "../utils/misc";
import Logger from "./logger";

import { User, UserAction } from "../types/types";

// Create actions
export const createEmailVerificationAction = async (username: string, email: string): Promise<string> => {
  try {
    const usersCollection = getCollection("users");
    if (!usersCollection) {
      Logger.error("Database - Failed to get users collection");
      return "";
    }

    const user: User = await usersCollection.findOne({ username }) as User;
    if (!user) {
      Logger.error("Create email verification action called on non-existent user");
      return "";
    }

    if (!user.actions) user.actions = [];

    let actionID = genRandomString(32);
    while (user?.actions?.find(a => a.link === actionID)) {
      actionID = genRandomString(32);
    }

    const emailAction: UserAction = {
      type: "emailVerification",
      used: false,
      link: actionID,
      email,
    }

    await usersCollection.updateOne({ username }, { $push: { actions: emailAction } });

    return actionID;
  }
  catch (e) {
    Logger.error(`Error while creating email verification action`);
    Logger.error(e);

    return "";
  }
};