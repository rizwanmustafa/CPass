import express, { Response, Request } from "express";
import { Schema } from "joi";
import { emailSchema, passwordSchema, usernameSchema } from "../schemas/user";

export const router = express.Router();

const validateSchema = (value: any, schema: Schema, res: Response) => {
  const { error } = schema.validate(value);
  if (error) return res.json(error.details[0].message);
}

let users: Record<string, { username: string, email: string, password: string }> = {};

router.post("/", (req, res) => {
  const { email, username, password } = req.body;
  validateSchema(username, usernameSchema, res);
  validateSchema(email, emailSchema, res);
  validateSchema(password, passwordSchema, res);

  console.log(`Email: ${email}`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);

  if (users[username]) return res.json("Username is taken!");

  users[username] = { username, email, password };

  console.log(users);

  return res.json("Your data has been successfully processed");
});

router.get("/", (_req, res) => {
  console.log(users);
  return res.json("Hello World!");
})
