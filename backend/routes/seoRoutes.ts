import express from 'express';
import { getRobotsTxt, getSitemapXml } from '../controllers/seoController.js';

const router = express.Router();

router.get('/robots.txt', getRobotsTxt);
router.get('/sitemap.xml', getSitemapXml);

export default router;
