import express from "express";
import { usernameSchema, emailSchema, authKeySchema, totpCodeSchema, userActionLinkSchema } from "../schemas/users";
import { createUser, deleteUser, authenticateUser, usernameAvailable } from "../controllers/users";
import { handleActions } from "../controllers/actions";
import jwtMiddleware from "../middlewares/jwt";

import validateSchema from "../schemas/validateSchema";
import { addVaultItem, getVaultItems, deleteVaultItem, updateVaultItem } from "../controllers/vault";

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

router.post(
  "/signin",
  (req, res, next) => {
    const { username, authKey, totpCode } = req.body;
    if (!validateSchema(username, usernameSchema, res)) return;
    if (!validateSchema(authKey, authKeySchema, res)) return;
    if (!validateSchema(totpCode, totpCodeSchema, res)) return;

    next();
  },
  authenticateUser
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

router.get(
  "/actions",
  (req, res, next) => {
    const username = req.query.username;
    const actionLink = req.query.link;

    if (!validateSchema(username, usernameSchema, res)) return;
    if (!validateSchema(actionLink, userActionLinkSchema, res)) return;

    next();
  },
  handleActions
);

router.get(
  "/vault",
  jwtMiddleware,
  getVaultItems
);

router.post(
  "/vault",
  (req, res, next) => {
    const item = req.body.item;
    if (!item) return res.status(400).json({ message: "'item' cannot be undefined or null" });

    next();
  },
  jwtMiddleware,
  addVaultItem
);

router.patch(
  "/vault",
  (req, res, next) => {
    const itemId = req.body.itemId;
    if (!itemId) return res.status(400).json({ message: "'itemId' cannot be undefined or null" });

    const item = req.body.item;
    if (!item) return res.status(400).json({ message: "'item' cannot be undefined or null" });

    next();
  },
  jwtMiddleware,
  updateVaultItem
);

router.delete("/vault",
  (req, res, next) => {
    const itemId = req.body.itemId;
    if (!itemId) return res.status(400).json({ message: "'itemId' cannot be undefined or null" });

    next();
  },
  jwtMiddleware,
  deleteVaultItem
);