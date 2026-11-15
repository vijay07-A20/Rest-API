import { Router } from 'express';
import { getRequests, getAnalytics } from '../controllers/requestController.js';

const router = Router();

router.get('/', getRequests);
router.get('/analytics', getAnalytics);

export default router;
