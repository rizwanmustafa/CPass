import express from "express";
import { usernameSchema, emailSchema, authKeySchema } from "../schemas/user";
import { createUser, deleteUser } from "../controllers/user";
import validateSchema from "../schemas/validateSchema";

export const router = express.Router();


router.post(
  "/",
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
  "/",
  deleteUser
);