import { Db, MongoClient } from "mongodb";
import "dotenv/config";
import Logger from "./utils/logger";

const { DB_URI, DB_NAME } = process.env;

if (DB_URI === undefined || DB_NAME === undefined) {
  Logger.error("Invalid values for DB configuration. Exiting with code 1");
  process.exit(1);
}


const client = new MongoClient(DB_URI, { connectTimeoutMS: 10000 });

let DB: undefined | Db;

export const connectToDB = async () => {
  Logger.info("Started connecting to database...");

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

export const disconnctFromDB = () => {
  if (!DB) { return }

  try {
    client.close();
    Logger.success(`Successfully closed connection to mongodb database: ${DB_NAME}`);
  }
  catch (e) {
    Logger.error("Error while closing the connection to mongodb database");
    Logger.error(`Error Message: ${e.message} Error Stack: ${e.stack}`);
  }
};

export const getCollection = (collectionName: string) => {
  if (!DB) {
    return undefined;
  }

  return DB.collection(collectionName);
}

export const getDB = () => DB;
