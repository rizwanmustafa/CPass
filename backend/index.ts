#!/usr/bin/env ts-node
import express from "express";
import morgan from "morgan";
import { router as UserRouter } from "./routes/users";

const app = express();
let requestsHandled = 0;
const startDate = new Date();

app.use(morgan('combined'));
app.use(express.json());
app.use((_req, _res, next) => {
  requestsHandled += 1
  next();
});

// Add Routers
app.use("/users", UserRouter);

app.get("/", (_req, res) => {
  res.json({
    "uptime": (new Date().getTime() - startDate.getTime()) / 1000,
    "requestsHandled": requestsHandled.toString()
  });
});

app.listen(5000, () => console.log("The server has started listening on port 5000"));