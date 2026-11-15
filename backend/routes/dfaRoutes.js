import { Router } from 'express';
import { getDfaState } from '../controllers/dfaController.js';

const router = Router();

router.get('/state', getDfaState);

export default router;
