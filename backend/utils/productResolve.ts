import mongoose from 'mongoose';
import Product, { type IProductDocument } from '../models/Product.js';

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

export const isObjectIdString = (value: string): boolean =>
  OBJECT_ID_PATTERN.test(value) && mongoose.Types.ObjectId.isValid(value);

export const findProductByIdOrModelKey = async (
  idOrModelKey: string
): Promise<IProductDocument | null> => {
  if (isObjectIdString(idOrModelKey)) {
    const byId = await Product.findById(idOrModelKey);
    if (byId) {
      return byId;
    }
  }

  return Product.findOne({ modelKey: idOrModelKey });
};
