import { Db, MongoClient } from "mongodb";
import "dotenv/config";
import Logger from "./utils/logger";

let client: undefined | MongoClient;
let DB: undefined | Db;
const { DB_URI, DB_NAME } = process.env;


export const dbInit = async () => {
  try {
    client = new MongoClient(DB_URI as string, { connectTimeoutMS: 10000 });
    return true;
  }
  catch (e) {
    Logger.error("DB initialization failed!");
    Logger.error(e);
    return false;
  }
}

export const connectToDB = async () => {
  Logger.info("Started connecting to database...");

  if (!client) {
    Logger.error("Database client has not yet been intialized. Intialize it first.");
    return;
  }

  try {
    await client.connect();
    DB = client.db(DB_NAME);
    Logger.success(`Successfully connected to mongodb database: ${DB_NAME}`);
  }
  catch (error) {
    if (typeof error.message === "string" || error.message instanceof String) {
      Logger.error(error.message);
    }
    else Logger.error(error);
    Logger.error("Failed to connect to database. Exiting with code 1");
    process.exit(1);
  };

};

export const disconnectFromDB = () => {
  if (!DB) {
    Logger.error("A database connection has not yet been established. Establish a connection first.");
    return;
  }

  if (!client) {
    Logger.error("Database client has not yet been intialized. Intialize it first.");
    return;
  }

  Logger.info("Started closing connection to database...");
  try {
    client.close();
    Logger.success(`Successfully closed connection to mongodb database: ${DB_NAME}`);
  }
  catch (e) {
    Logger.error("Error while closing the connection to mongodb database");
    Logger.error(`Error Message: ${e.message}\nError Stack: ${e.stack}`);
  }
};

export const getCollection = (collectionName: string) => {
  if (!DB) {
    Logger.error("A database connection has not yet been established. Establish a connection first.");
    return undefined;
  }

  return DB.collection(collectionName);
}

export const getDB = () => DB;
