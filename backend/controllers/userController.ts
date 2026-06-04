import asyncHandler from 'express-async-handler';
import type { Request, Response } from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { clearAuthCookie, setAuthCookie } from '../utils/authCookie.js';

const toPublicUser = (user: { _id: unknown; name: string; email: string; isAdmin: boolean }) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin
});

const authUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    setAuthCookie(res, generateToken(user._id));
    res.json(toPublicUser(user));
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password
  });

  if (user) {
    setAuthCookie(res, generateToken(user._id));
    res.status(201).json(toPublicUser(user));
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    setAuthCookie(res, generateToken(updatedUser._id));
    res.json(toPublicUser(updatedUser));
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const logoutUser = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
});

const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find({});
  res.json(users);
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (String(req.user._id) === String(req.params.id)) {
    res.status(400);
    throw new Error('Admin cannot delete their own account');
  }

  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ msg: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUser
};
