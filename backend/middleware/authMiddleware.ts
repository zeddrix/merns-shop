import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import type { NextFunction, Request, Response } from 'express';
import type { Types } from 'mongoose';
import { AUTH_COOKIE_NAME } from '../utils/authCookie.js';
import type { AuthTokenPayload } from '../utils/generateToken.js';

interface JwtUser {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  isAdmin: boolean;
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

const userFromPayload = (payload: AuthTokenPayload): JwtUser => ({
  _id: payload.id,
  name: payload.name,
  email: payload.email,
  isAdmin: payload.isAdmin
});

const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload;

    if (!decoded.id || !decoded.email) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }

    req.user = userFromPayload(decoded) as Request['user'];
    next();
  } catch (err) {
    console.error(err);
    res.status(401);
    if (err instanceof Error && err.message.startsWith('Not authorized,')) {
      throw err;
    }
    throw new Error('Not authorized, token failed');
  }
});

const optionalAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload;
    if (decoded.id && decoded.email) {
      req.user = userFromPayload(decoded) as Request['user'];
    }
  } catch {
    // ignore invalid token for optional auth
  }
  next();
});

const admin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized. Only the ADMIN can access this route ;)');
  }
});

export { protect, admin, optionalAuth };
