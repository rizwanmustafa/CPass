import Logger from "./logger";

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charsLength = characters.length;

export const genRandomString = (length: number) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
}

export const validateEnvironmentVariables = () : boolean => {
  // TODO: Refactor this code later creating another function that takes in a key aka environement variable and checks if it is defined
  let failedCount = 0;

  // General Environment Variables
  if (!process.env.SERVER_PORT) {
    failedCount += 1;
    Logger.error("Environment variable 'SERVER_PORT' not set");
  }
  if (!process.env.BASE_URL) {
    failedCount += 1;
    Logger.error("Environment variable 'BASE_URL' not set");
  }
  if (!process.env.DB_NAME) {
    failedCount += 1;
    Logger.error("Environment variable 'DB_NAME' not set");
  }
  if (!process.env.DB_URI) {
    failedCount += 1;
    Logger.error("Environment variable 'DB_URI' not set");
  }
  if (!process.env.MODE) {
    failedCount += 1;
    Logger.error("Environment variable 'MODE' not set");
  }

  // Mail Environment Variables
  if (!process.env.MAIL_USER) {
    failedCount += 1;
    Logger.error("Environment variable 'MAIL_USER' not set");
  }
  if (!process.env.CLIENT_ID) {
    failedCount += 1;
    Logger.error("Environment variable 'CLIENT_ID' not set");
  }
  if (!process.env.CLIENT_SECRET) {
    failedCount += 1;
    Logger.error("Environment variable 'CLIENT_SECRET' not set");
  }
  if (!process.env.CLIENT_REFRESH_TOKEN) {
    failedCount += 1;
    Logger.error("Environment variable 'CLIENT_REFRESH_TOKEN' not set");
  }
  if (!process.env.CLIENT_REDIRECT_URL) {
    failedCount += 1;
    Logger.error("Environment variable 'CLIENT_REDIRECT_URL' not set");
  }

  // Logging Environment Variables
  if (!process.env.LOG_FOLDER_PATH) {
    failedCount += 1;
    Logger.error("Environment variable 'LOG_FOLDER_PATH' not set");
  }
  if (!process.env.LOG_FILE_MAX_SIZE) {
    failedCount += 1;
    Logger.error("Environment variable 'LOG_FILE_MAX_SIZE' not set");
  }

  if (failedCount !== 0) {
    Logger.error(`${failedCount} environment variable(s) are not set`);
    return false;
  }
  return true;
}