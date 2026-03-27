import { Router } from 'express';
import curriculumRouter from './curriculum';

const router = Router();

router.use('/curriculum', curriculumRouter);

export default router;
