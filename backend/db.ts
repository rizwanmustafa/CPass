import { Db, MongoClient } from "mongodb";
import Logger from "./utils/logger";

let client: undefined | MongoClient;
let DB: undefined | Db;
const { DB_URI, DB_NAME } = process.env;


export const dbInit = async () => {
  try {
    client = new MongoClient(DB_URI as string, { connectTimeoutMS: 10000 });
    Logger.success("DB client initialized");
    return true;
  }
  catch (e) {
    Logger.error("DB client initialization failed!");
    Logger.error(e);
    return false;
  }
};

export const connectToDB = async () => {
  Logger.info("Started connecting to database...");

  if (!client) {
    Logger.error("Database client has not yet been intialized. Intializing it automatically.");
    if (await dbInit() === false) {
      Logger.error("Automatic database intialization failed!");
      Logger.error("Exiting the server with code 1");
      process.exit(1);
    }
  }
  if (!client) return; // This code shouldn't be executed because we already take care of it in the previous if statement

  try {
    await client.connect();
    DB = client.db(DB_NAME);
    Logger.success(`Successfully connected to mongodb database: ${DB_NAME}`);
  }
  catch (error) {
    Logger.error(error);
    Logger.error("Failed to connect to database. Exiting with code 1");
    process.exit(1);
  }

};

export const disconnectFromDB = async () => {
  Logger.info("Started closing connection to database...");
  try {
    if (client) client.close();
    Logger.success("Closed connection to mongodb database");
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
};

export const getDB = () => DB;
