import { Response } from "express";
import { Schema } from "joi";

export const validateSchema = (value: any, schema: Schema, res: Response) => {
  const { error } = schema.validate(value);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return false;
  }

  return true;
}

export default validateSchema;