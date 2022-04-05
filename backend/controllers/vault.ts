import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../db";

import { UserVaultObject, UserJwt } from "../types/types";
import Logger from "../utils/logger";

export const getVaultItems = async (req: Request, res: Response) => {
  try {

    const user = req.user as UserJwt;

    const usersCollection = await getCollection("users");
    const vaultCollection = await getCollection("vault");

    if (!(await usersCollection.findOne({ uuid: user.uuid }))) return res.status(404).json({ message: "User not found" });

    if (!(await vaultCollection.findOne({ uuid: user.uuid }))) {
      vaultCollection.insertOne({ uuid: user.uuid, vaultItems: [] });
      return getVaultItems(req, res);
    }

    const userCreds = (await vaultCollection.findOne({ uuid: user.uuid })) as UserVaultObject;

    return res.status(200).json({ vaultItems: userCreds.vaultItems });
  }
  catch (e) {
    Logger.error("Error while getting vault items");
    Logger.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addVaultItem = async (req: Request, res: Response) => {
  try {

    const item = req.body.item;
    const user = req.user as UserJwt;


    const usersCollection = await getCollection("users");
    const vaultCollection = await getCollection("vault");

    if (!(await usersCollection.findOne({ uuid: user.uuid }))) return res.status(404).json({ message: "User not found" });

    vaultCollection.updateOne({ uuid: user.uuid }, { $push: { vaultItems: { ...item, _id: new ObjectId() } } }, { upsert: true });

    return res.status(200).json({ message: "Vault Item added" });
  }
  catch (e) {
    Logger.error("Error while adding a vault item");
    Logger.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateVaultItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.body.itemId;
    const item = req.body.item;
    const user = req.user as UserJwt;

    const usersCollection = await getCollection("users");
    const vaultCollection = await getCollection("vault");

    if (!(await usersCollection.findOne({ uuid: user.uuid }))) return res.status(404).json({ message: "User not found" });

    await vaultCollection.updateOne(
      { uuid: user.uuid, "vaultItems._id": new ObjectId(itemId) },
      {
        $set: {
          "vaultItems.$": { ...item, _id: new ObjectId(itemId) }
        }
      });

    return res.status(200).json({ message: "Vault item updated" });
  }
  catch (e) {
    Logger.error("Error while updating vault item");
    Logger.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteVaultItem = async (req: Request, res: Response) => {
  try {

    const itemId = req.body.itemId;
    const user = req.user as UserJwt;

    const usersCollection = await getCollection("users");
    const vaultCollection = await getCollection("vault");

    if (!(await usersCollection.findOne({ uuid: user.uuid }))) return res.status(404).json({ message: "User not found" });

    await vaultCollection.updateOne({ uuid: user.uuid }, { $pull: { vaultItems: { _id: new ObjectId(itemId) } } });

    return res.status(200).json({ message: "Vault item deleted" });
  }
  catch (e) {
    Logger.error("Error while deleting vault item");
    Logger.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};