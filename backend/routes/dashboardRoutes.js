import { Router } from 'express';
import { getStats, getNetworkInfo } from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', getStats);
router.get('/network-info', getNetworkInfo);

export default router;
