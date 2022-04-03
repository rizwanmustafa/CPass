import joi from "joi";

export const usernameSchema = joi.string()
  .label("Username")
  .min(4)
  .max(32)
  .regex(/^[0-9a-zA-Z]+$/)
  .required()
  .messages({
    "string.pattern.base":
      "Invalid Username. A username can only contain alphanumeric characters",
    "string.max": "Username cannot be larger than 32 characters",
    "string.min": "Username cannot be smaller than 4 characters",
  });

export const emailSchema = joi.string()
  .label("Email address")
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

export const authKeySchema = joi.string()
  .label("Auth key")
  .min(64)
  .max(128)
  .required()
  .messages({
    "string.min": "Auth key cannot be be smaller than 64 characters",
    "string.max": "Auth key cannot be larger than 128 characters"
  });

export const totpCodeSchema = joi.string()
  .label("2FA code")
  .length(6)
  .regex(/^[0-9]{6}$/)
  .required()
  .messages({
    "string.pattern.base": "Invalid totp code",
    "string.length": "Invalid totp code. A totp code must be 6 digits long",
  });