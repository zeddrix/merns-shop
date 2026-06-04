import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';

const generateToken = (id: Types.ObjectId | string): string => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET as string, {
    expiresIn: '30d'
  });
};

export default generateToken;
