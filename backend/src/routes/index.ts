import { Router, Request, Response } from 'express';
import authRouter from './auth/index.js';
import staticRouter from './static/index.js';
import userRouter from './user/index.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/static', staticRouter);
router.use('/user', userRouter);

export default router;
