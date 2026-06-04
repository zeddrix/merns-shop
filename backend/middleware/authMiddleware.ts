import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import type { NextFunction, Request, Response } from 'express';
import User from '../models/User.js';
import { AUTH_COOKIE_NAME } from '../utils/authCookie.js';

interface JwtPayload {
  id: string;
}

const extractToken = (req: Request): string | undefined => {
  if (req.cookies?.[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME] as string;
  }

  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }

  return undefined;
};

const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

const admin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized. Only the ADMIN can access this route ;)');
  }
});

export { protect, admin };
