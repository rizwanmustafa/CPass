import express from "express";
import validateSchema from "../schemas/validateSchema";
import { actionLinkSchema } from "../schemas/actions";
import { usernameSchema } from "../schemas/user";
import { handleActions } from "../controllers/actions";

export const router = express.Router();


router.get(
  "/",
  (req, res, next) => {
    const username = req.query.username;
    const actionLink = req.query.link;

    if (!validateSchema(username, usernameSchema, res)) return;
    if (!validateSchema(actionLink, actionLinkSchema, res)) return;

    next();
  },
  handleActions
);