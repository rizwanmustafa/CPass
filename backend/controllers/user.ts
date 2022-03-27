import { Request, Response } from "express";
import { getCollection } from "../db";

const usernameUsed = async (username: string): Promise<boolean> => {
  const usersCollection = getCollection("users");
  if (!usersCollection) return false;

  const user = await usersCollection.findOne({ username });
  return !!user;
}

const emailUsed = async (email: string): Promise<boolean> => {
  const usersCollection = getCollection("users");
  if (!usersCollection) return false;

  const user = await usersCollection.findOne({ email });
  return !!user;
}

export const createUser = async (req: Request, res: Response) => {

  type UserData = {
    email: string,
    username: string,
    authKey: string
  };

  const { email, username, authKey }: UserData = req.body;

  if (await usernameUsed(username)) return res.status(400).json({ message: "Username already in use" });
  if (await emailUsed(email)) return res.status(400).json({ message: "Email already in use" });

  const usersCollection = getCollection("users");

  if (!usersCollection) return res.status(500).json({ message: "Internal Server Error" }); // TODO: Later use a custom logger as well

  // TODO: Generate 2FA secret

  usersCollection.insertOne({ email, username, authKey });

  return res.status(200).json({ message: "Account created" });
};


export const deleteUser = async (req: Request, res: Response) => {
  const { username }: { username: string } = req.body;

  const usersCollection = getCollection("users");
  if (!usersCollection) return res.status(500).json({ message: "Internal Server Error" }); // TODO: Later use a custom logger as well

  const user = await usersCollection.findOne({ username });

  if (!user) return res.status(404).json({ message: "User not found" });

  usersCollection.deleteOne({ _id: user._id });

  return res.status(200).json({ message: "User deleted" });
}