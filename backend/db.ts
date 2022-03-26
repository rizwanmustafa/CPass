import { Db, MongoClient } from "mongodb";
import "dotenv/config";
import colors from "colors/safe";

const { DB_URI, DB_NAME } = process.env;

if (DB_URI === undefined || DB_NAME === undefined) {
  console.error("Invalid values for DB configuration. Exiting with code 1");
  process.exit(1);
}


const client = new MongoClient(DB_URI, { connectTimeoutMS: 10000 });

let DB: undefined | Db;

export const connectToDB = async () => {
  console.log("Started connecting to database...");

  try {
    await client.connect();
    DB = client.db(DB_NAME);
    console.log(colors.green(`Successfully connected to mongodb database: ${DB_NAME}`));
  }
  catch (error) {
    if (typeof error.message === "string" || error.message instanceof String) {
      console.error(colors.red(error.message));
    }
    else console.error(error);
    console.error(colors.red("Failed to connect to database. Exiting with code 1"));
    process.exit(1);
  };

};

export const disconnctFromDB = () => {
  if (!DB) { return }

  try {
    client.close();
    console.log(colors.green(`Successfully closed connection to mongodb database: ${DB_NAME}`));
  }
  catch (e) {
    console.error(colors.red("Error while closing the connection to mongodb database"));
    if (typeof e === "string" || e instanceof String) {
      console.error(colors.red(e as string));
    }
    else {
      console.error(e);
    }
  }
};

export const getCollection = (collectionName: string) => {
  if (!DB) {
    return undefined;
  }

  return DB.collection(collectionName);
}

export const getDB = () => DB;
