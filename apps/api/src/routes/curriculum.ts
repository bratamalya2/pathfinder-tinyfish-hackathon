import { Router } from 'express';
import { CurriculumController } from '../controllers/CurriculumController';

const router = Router();

router.post('/generate', CurriculumController.generateCurriculum);
router.get('/status/:jobId', CurriculumController.getJobStatus);

export default router;
