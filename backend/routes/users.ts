import express from "express";
import { usernameSchema, emailSchema, authKeySchema } from "../schemas/users";
import { createUser, deleteUser, usernameAvailable} from "../controllers/users";
import validateSchema from "../schemas/validateSchema";

export const router = express.Router();

router.post(
  "/signup",
  (req, res, next) => {
    const { email, username, authKey } = req.body;
    if (!validateSchema(username, usernameSchema, res)) return;
    if (!validateSchema(email, emailSchema, res)) return;
    if (!validateSchema(authKey, authKeySchema, res)) return;

    next();
  },
  createUser
);

router.delete(
  "/delete",
  deleteUser
);

router.get(
  "/usernameAvailable",
  (req, res, next) => {
    const { username } = req.query;

    if (!validateSchema(username, usernameSchema, res)) return;

    next();
  },
  usernameAvailable
);