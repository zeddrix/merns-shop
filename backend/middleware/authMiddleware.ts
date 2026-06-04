import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import type { NextFunction, Request, Response } from 'express';
import User from '../models/User.js';

interface JwtPayload {
  id: string;
}

const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.user = user;

      next();
      return;
    } catch (err) {
      console.error(err);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
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
