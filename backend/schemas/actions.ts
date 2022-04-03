import Joi from "joi";

export const actionLinkSchema = Joi.string().label("Action link").length(32).required();