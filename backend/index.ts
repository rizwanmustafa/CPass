#!/usr/bin/env ts-node
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectToDB, disconnctFromDB } from "./db.js";

// Import routes
import { router as UserRouter } from "./routes/user";
import chalk from "chalk";
import Logger from "./utils/logger";

const app = express();
let requestsHandled = 0;
const startDate = new Date();

// Middlewares
app.use(morgan('combined'));

app.use(cors());

app.use(express.json());

app.use((_req, _res, next) => {
  requestsHandled += 1
  next();
});

// Add routes
app.use("/users", UserRouter);

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
  await connectToDB();
  app.listen(SERVER_PORT)
    .on("error", (error) => {
      Logger.error("Error while starting the server");
      Logger.error(error.message);
      Logger.error("Exiting the server with code 1");
      process.exit(1);
    });
  Logger.success(`The server has started listening on port ${SERVER_PORT}`);
  Logger.success(`Server: http://localhost:${SERVER_PORT}`);
};

let cleaningUp = false;

const cleanUpServer = () => {
  if(cleaningUp) return;
  cleaningUp = true;
  Logger.info("Exiting server due to manual termination with code 0");
  disconnctFromDB();
  process.exit(0);
}

process.on("exit", cleanUpServer);
process.on("SIGINT", cleanUpServer);
process.on("SIGTERM", cleanUpServer);
process.on("SIGUSER1", cleanUpServer);
process.on("SIGUSER2", cleanUpServer);

bootServer();