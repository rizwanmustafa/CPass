#!/usr/bin/env ts-node
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

const bootServer = async () => {
  await connectToDB();
  app.listen(5005, () => Logger.success(`The server has started listening on port: ${chalk.underline("5005")}`));
};

const cleanUpServer = () => {
  disconnctFromDB();
  process.exit(0);
}

process.on("SIGINT", cleanUpServer);
process.on("SIGTERM", cleanUpServer);
process.on("SIGUSER1", cleanUpServer);
process.on("SIGUSER2", cleanUpServer);

bootServer();