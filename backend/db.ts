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

export const openConnection = () => {
  client.connect((err, newDB) => {
    if (err || !newDB) {
      console.error(colors.red("Error connecting to DB"));
      if (err)
        console.error(colors.red(err.message));

      if (!newDB)
        console.error(colors.red("DB is undefined"));

      console.log(colors.red("Exiting with code 1"));
      process.exit(1);
    }

    DB = newDB.db(DB_NAME);
    console.log(colors.green(`Successfully connected to mongodb database: ${DB_NAME}`));

  });
};

export const closeConnection = () => {
  if (!DB) { return }

  try {
    client.close();
    console.log(colors.green(`Successfully closed connection to mongodb database: ${DB_NAME}`));
  }
  catch (e) {
    console.error(colors.red("There was an error closing the connection to mongodb database"));
    console.error(colors.red(e as string));
  }
};

export const getCollection = (collectionName: string) => {
  if (!DB) {
    return undefined;
  }

  return DB.collection(collectionName);
}

process.on("SIGINT", closeConnection)

export const getDB = () => DB;

openConnection();
