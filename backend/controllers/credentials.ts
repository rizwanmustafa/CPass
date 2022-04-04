import { Request, Response } from "express";
import { getCollection } from "../db";

import { UserCredentialObject, UserJwt } from "../types/types";

export const addCredential = async (req: Request, res: Response) => {
  const credential = req.body.credential;
  const user = req.user as UserJwt;


  const usersCollection = await getCollection("users");
  const credsCollection = await getCollection("credentials");

  if (!(await usersCollection.findOne({ uuid: user.uuid }))) return res.status(404).json({ message: "User not found" });

  credsCollection.updateOne({ uuid: user.uuid }, { $push: { credentials: credential } }, { upsert: true });

  return res.status(200).json({ message: "Credential added" });
};

export const getCredentials = async (req: Request, res: Response) => {
  const user = req.user as UserJwt;

  const usersCollection = await getCollection("users");
  const credsCollection = await getCollection("credentials");

  if (!(await usersCollection.findOne({ uuid: user.uuid }))) return res.status(404).json({ message: "User not found" });

  if (!(await credsCollection.findOne({ uuid: user.uuid }))) {
    credsCollection.insertOne({ uuid: user.uuid, credentials: [] });
    return getCredentials(req, res);
  }

  const userCreds = (await credsCollection.findOne({ uuid: user.uuid })) as UserCredentialObject;

  return res.status(200).json({ credentials: userCreds.credentials });
};