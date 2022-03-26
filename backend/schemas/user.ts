import joi from "joi";

export const usernameSchema = joi.string()
  .min(4)
  .max(32)
  .regex(/^[0-9a-zA-Z]+$/)
  .required()
  .messages({
    "string.pattern.base":
      "Invalid Username. A username can only contain alphanumeric characters",
    "string.max": "Username exceeds maximum of 16 characters",
  });

export const emailSchema = joi.string()
  .regex(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
  .min(3)
  .max(320)
  .required()
  .messages({
    "string.pattern.base": "Invalid email address",
    "string.min": "Email address cannot be be smaller than 3 characters",
    "string.max": "Email address cannot be be larger than 320 characters"
  });

export const passwordSchema = joi.string()
  .min(16)
  .max(256)
  .regex(/^(?=(.*[a-z]){3,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{16,}$/)
  .required()
  .messages({
    "string.pattern.base": "Invalid password. A password must contain at least: 3 lowercase letters, 2 uppercase letters, 2 numbers and 1 special character",
    "string.min": "Password cannot be be smaller than 16 characters",
    "string.max": "Password cannot be larger than 256 characters"
  });