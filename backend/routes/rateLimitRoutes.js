import { Router } from 'express';
import { getRateLimitStatus, resetClientLimit } from '../controllers/rateLimitController.js';

const router = Router();

router.get('/status', getRateLimitStatus);
router.post('/reset', resetClientLimit);

export default router;
