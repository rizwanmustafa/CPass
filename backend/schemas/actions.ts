import Joi from "joi";

export const actionLinkSchema = Joi.string().length(32).required();