import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Logger from "../utils/logger";

import { UserJwt } from "../types/types";

const jwtMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = await jwt.verify(req.headers.authorization as string, process.env.JWT_SECRET as string);
    req.user = payload as UserJwt;
    next();
  }
  catch (e) {
    if (e instanceof jwt.JsonWebTokenError || e instanceof jwt.NotBeforeError || e instanceof jwt.TokenExpiredError)
      return res.json({ message: "Invalid token" });

    Logger.error("Error while verifying JWT");
    Logger.error(e);
    return res.json({ message: "Internal Server Error" });
  }
};

export default jwtMiddleware;
