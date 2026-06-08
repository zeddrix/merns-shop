import type { ServeStaticOptions } from 'serve-static';
import fs from 'node:fs';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';

const encodingExtension = (encoding: string): string | null => {
  if (encoding.includes('br')) return '.br';
  if (encoding.includes('gzip')) return '.gz';
  return null;
};

export const createPrecompressedStatic = (
  rootDir: string,
  options: ServeStaticOptions = {}
): express.RequestHandler[] => {
  const staticHandler = express.static(rootDir, options);

  const precompressedHandler = (req: Request, res: Response, next: NextFunction): void => {
    const acceptEncoding = req.headers['accept-encoding'] ?? '';
    const ext = encodingExtension(acceptEncoding);
    if (!ext || !req.path.startsWith('/assets/')) {
      next();
      return;
    }

    const filePath = path.join(rootDir, req.path.slice(1));
    const compressedPath = `${filePath}${ext}`;

    if (!fs.existsSync(compressedPath)) {
      next();
      return;
    }

    if (ext === '.br') {
      res.setHeader('Content-Encoding', 'br');
    } else if (ext === '.gz') {
      res.setHeader('Content-Encoding', 'gzip');
    }

    res.type(path.extname(filePath));
    res.sendFile(compressedPath);
  };

  return [precompressedHandler, staticHandler];
};
