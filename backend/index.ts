#!/usr/bin/env ts-node
import "dotenv/config";
import { Express } from "express";

import buildApp from "./app";
import { dbInit, connectToDB, disconnectFromDB } from "./db.js";
import Logger from "./utils/logger";

// Import routes
import { router as UserRouter } from "./routes/users";
import { router as ActionsRouter } from "./routes/actions";
import { validateEnvironmentVariables } from "./utils/misc.js";


const app = buildApp();
let cleaningUp = false;

const bootServer = async (server: Express) => {
  if (!validateEnvironmentVariables()) process.exit(1);

  await dbInit();
  await connectToDB();

  server.listen(process.env.SERVER_PORT).on("error", (error) => {
    Logger.error("Error while starting the server");
    Logger.error(error.message);
    process.exit(1);
  });

  Logger.success(`The server has started listening on port ${process.env.SERVER_PORT}`);
  Logger.success(`Server: http://localhost:${process.env.SERVER_PORT}`);
};

const cleanUpServer = async (e: number) => {
  if (cleaningUp) return;
  cleaningUp = true;

  Logger.info("Started cleaning up server...");

  await disconnectFromDB();

  Logger.success("Cleaned up server");
  Logger.error(`Exiting the server with code ${e.toString()}`);

  process.exit(e);
}

// Add routes
app.use("/users", UserRouter);
app.use("/actions", ActionsRouter);

// Dynamic 404 Handling
app.use("*", (_req, res) => res.status(404).json({ message: "Resource not found!" }));

process.on("exit", cleanUpServer);
process.on("SIGINT", cleanUpServer);
process.on("SIGTERM", cleanUpServer);
process.on("SIGUSER1", cleanUpServer);
process.on("SIGUSER2", cleanUpServer);

bootServer(app);