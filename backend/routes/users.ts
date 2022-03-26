import express, { Response, Request } from "express";
import { Schema } from "joi";
import { emailSchema, passwordSchema, usernameSchema } from "../schemas/user";

export const router = express.Router();

const validateSchema = (value: any, schema: Schema, res: Response) => {
  const { error } = schema.validate(value);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return false;
  }

  return true;
}

let users: Record<string, { username: string, email: string, password: string }> = {};

router.post("/", (req, res) => {
  const { email, username, password } = req.body;
  if (!validateSchema(username, usernameSchema, res)) return;
  if (!validateSchema(email, emailSchema, res)) return;
  if (!validateSchema(password, passwordSchema, res)) return;

  console.log(`Email: ${email}`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);

  if (users[username]) return res.json("Username is taken!");

  users[username] = { username, email, password };

  console.log(users);

  return res.json({ message: "Your data has been successfully processed" });
});

router.get("/", (_req, res) => {
  console.log(users);
  return res.json("Hello World!");
})

router.get("/usernameavailable", (req, res) => {
  const username = req.query.username as string ?? "";
  if (username === "" || !users[username]) return res.json({ available: true });
  else return res.json({ available: false });
});
