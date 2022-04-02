import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import { format as dateFormat } from "date-fns";

let requestsHandled = 0;

const buildApp = (): Express => {
  const startDate = new Date().getTime();

  const server = express();

  morgan.token("date", () => dateFormat(new Date(), "dd-MMM-yyyy HH:mm:ss:SSS"));

  // Add Middlewares
  server.use(morgan(":date[clf]\t:method :url :status :res[content-length] - :response-time ms"));

  server.use(cors());

  server.use(express.json());

  server.use((_req, _res, next) => {
    requestsHandled += 1
    next();
  });

  server.get("/", (_req, res) => {
    return res.json({
      "uptime": new Date().getTime() - startDate,
      "requestsHandled": requestsHandled.toString()
    });
  });

  return server
}

export default buildApp