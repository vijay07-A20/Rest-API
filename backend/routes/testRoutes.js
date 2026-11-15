import { Router } from 'express';
import { sendSingleTestRequest, sendBatchSimulation } from '../controllers/testController.js';

const router = Router();

router.post('/request', sendSingleTestRequest);
router.post('/batch', sendBatchSimulation);

export default router;
