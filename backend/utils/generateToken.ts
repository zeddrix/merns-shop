import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';

export interface AuthTokenPayload {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface TokenUserLike {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  isAdmin: boolean;
}

const generateToken = (user: TokenUserLike): string => {
  const payload: AuthTokenPayload = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '30d'
  });
};

export default generateToken;
