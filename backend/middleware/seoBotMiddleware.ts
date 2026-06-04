import type { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { buildHomeBotHtml, buildProductBotHtml } from '../utils/seoHtml.js';
import { isSeoBot } from '../utils/seoBots.js';

export const seoBotMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || !isSeoBot(req.get('user-agent'))) {
      next();
      return;
    }

    if (req.path === '/' || req.path === '') {
      res.type('html');
      res.send(buildHomeBotHtml());
      return;
    }

    const productMatch = /^\/product\/([^/]+)\/?$/.exec(req.path);
    if (productMatch) {
      const product = await Product.findById(productMatch[1]);
      if (product) {
        res.type('html');
        res.send(buildProductBotHtml(product));
        return;
      }
    }

    next();
  }
);
