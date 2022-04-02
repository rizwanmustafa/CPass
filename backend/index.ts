#!/usr/bin/env ts-node
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { dbInit, connectToDB, disconnectFromDB } from "./db.js";
import Logger from "./utils/logger";

// Import routes
import { router as UserRouter } from "./routes/user";
import { router as ActionsRouter } from "./routes/actions";
import { validateEnvironmentVariables } from "./utils/misc.js";
import { format as dateFormat } from "date-fns";


const app = express();
let requestsHandled = 0;
const startDate = new Date();

morgan.token("date", () => dateFormat(new Date(), "dd-MMM-yyyy HH:mm:ss:SSS"));

// Middlewares
app.use(morgan(":date[clf]\t:method :url :status :res[content-length] - :response-time ms"));

app.use(cors());

app.use(express.json());

app.use((_req, _res, next) => {
  requestsHandled += 1
  next();
});

// Add routes
app.use("/users", UserRouter);
app.use("/actions", ActionsRouter);

app.get("/", (_req, res) => {
  res.json({
    "uptime": new Date().getTime() - startDate.getTime(),
    "requestsHandled": requestsHandled.toString()
  });
});

// Dynamic 404 Handling
app.use("*", (_req, res) => {
  return res.status(404).json({
    message: "Could not find the resource you were looking for!"
  });
});

const SERVER_PORT = process.env.SERVER_PORT ?? 5005;

const bootServer = async () => {
  if (!validateEnvironmentVariables()) process.exit(1);

  await dbInit();
  await connectToDB();

  app.listen(SERVER_PORT).on("error", (error) => {
    Logger.error("Error while starting the server");
    Logger.error(error.message);
    process.exit(1);
  });

  Logger.success(`The server has started listening on port ${SERVER_PORT}`);
  Logger.success(`Server: http://localhost:${SERVER_PORT}`);
};

let cleaningUp = false;

const cleanUpServer = async (e: number) => {
  if (cleaningUp) return;
  cleaningUp = true;

  Logger.info("Started cleaning up server for closing");

  await disconnectFromDB();

  if (e === 0) Logger.info(`Exiting server due to manual termination with code 0`);
  else Logger.error(`Exiting the server with code ${e.toString()}`);

  process.exit(e);
}

process.on("exit", cleanUpServer);

process.on("SIGINT", cleanUpServer);
process.on("SIGTERM", cleanUpServer);
process.on("SIGUSER1", cleanUpServer);
process.on("SIGUSER2", cleanUpServer);

bootServer();
