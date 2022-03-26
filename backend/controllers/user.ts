import { Request, Response } from "express";
export const createUser = (req: Request, res: Response) => {
  type UserData = {
    email: string,
    username: string,
    password: string
  };

  const { email, username, password }: UserData = req.body;

  // Debug Statements TODO: Remove later
  console.log(`Email: ${email}`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);

  let users : Record<string, UserData> = {};

  if (users[username]) return res.json("Username is taken!");

  users[username] = { username, email, password };

  console.log(users);

  return res.json({ message: "Your data has been successfully processed" });
};