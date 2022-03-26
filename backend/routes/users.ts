import express from "express";
import { emailSchema, passwordSchema, usernameSchema } from "../schemas/user";
import { createUser } from "../controllers/user";
import validateSchema from "../schemas/validateSchema";

export const router = express.Router();


router.post(
  "/",
  (req, res, next) => {
    const { email, username, password } = req.body;
    if (!validateSchema(username, usernameSchema, res)) return;
    if (!validateSchema(email, emailSchema, res)) return;
    if (!validateSchema(password, passwordSchema, res)) return;

    next();
  },
  createUser
);