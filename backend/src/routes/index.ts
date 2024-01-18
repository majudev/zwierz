import { Router, Request, Response } from 'express';
import authRouter from './auth/index.js';
import staticRouter from './static/index.js';
import userRouter from './user/index.js';
import teamRouter from './team/index.js';
import trialRouter from './trial/index.js';
import appointmentsRouter from './appointments/index.js';
import administrativeRouter from './administrative/index.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/static', staticRouter);
router.use('/user', userRouter);
router.use('/team', teamRouter);
router.use('/trial', trialRouter);
router.use('/appointments', appointmentsRouter);
router.use('/administrative', administrativeRouter);

export default router;
