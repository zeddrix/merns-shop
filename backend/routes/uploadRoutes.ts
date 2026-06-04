import path from 'path';
import express from 'express';
import multer from 'multer';
import type { Request, Response } from 'express';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, 'uploads/');
  },
  filename(_req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'));
  }
}

const upload = multer({
  storage,
  fileFilter(_req, file, cb) {
    checkFileType(file, cb);
  }
});

router.post('/', protect, admin, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  res.send(`/${req.file.path}`);
});

export default router;
