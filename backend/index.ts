#!/usr/bin/env ts-node
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { router as UserRouter } from "./routes/users";

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

app.listen(5000, () => console.log("The server has started listening on port 5000"));