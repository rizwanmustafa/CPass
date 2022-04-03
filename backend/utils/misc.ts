import Logger from "./logger";
import { getCollection } from "../db";
import { User } from "../types/types";
import { ObjectId } from "mongodb";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const charsLength = characters.length;

export const isUsernameUsed = async (username: string): Promise<boolean> => {
  try {
    const usersCollection = await getCollection("users");

    const user = await usersCollection.findOne({ username });
    return !!user;
  }
  catch (e) {
    Logger.error("Could not check if username is used");
    Logger.error(e);
    return true;
  }
};

export const isEmailUsed = async (email: string): Promise<boolean> => {
  const usersCollection = await getCollection("users");

  const user = await usersCollection.findOne({ email });
  return !!user;
};

export const createDefUserObj = (username: string, email: string, authKey: string, secret: string): User => {
  return {
    _id: new ObjectId(),
    username,
    email,
    authKey,
    secret,
    verfied: false,
    settings: {
      tokenExpDuration: 900,
    },
    actions: [],
  };
};


export const genRandomString = (length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
};

export const validateEnvironmentVariables = (): boolean => {
  // TODO: Refactor this code later creating another function that takes in a key aka environement variable and checks if it is defined
  let failedCount = 0;

  const requiredEnvVars = [
    "SERVER_PORT",
    "BASE_URL",
    "DB_NAME",
    "DB_URI",
    "MODE",
    "MAIL_USER",
    "CLIENT_ID",
    "CLIENT_SECRET",
    "CLIENT_REFRESH_TOKEN",
    "CLIENT_REDIRECT_URI",
    "LOG_FOLDER_PATH",
    "LOG_FILE_MAX_SIZE",
    "JWT_SECRET",
  ];

  const presenceCheck = (key: string) => {
    if (!process.env[key]) {
      failedCount += 1;
      Logger.error(`Environment variable '${key}' is not defined`);
    }
  };

  // TODO: Later have optional environment variables and set their default values if missing. Also notify the user
  requiredEnvVars.forEach(key => { presenceCheck(key); });

  if (failedCount !== 0) Logger.error(`${failedCount} errors found. `);

  return failedCount === 0;
};