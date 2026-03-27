import { Request, Response } from 'express';
import { CurriculumOrchestrator } from '../services/CurriculumOrchestrator';

export class CurriculumController {
  
  /**
   * POST /api/curriculum/generate
   */
  static async generateCurriculum(req: Request, res: Response): Promise<void> {
    try {
      const { careerGoal, currentLevel } = req.body;

      if (!careerGoal || !currentLevel) {
        res.status(400).json({ error: 'Missing required fields: careerGoal, currentLevel' });
        return;
      }

      const jobId = CurriculumOrchestrator.startCurriculumGeneration(careerGoal, currentLevel);
      res.status(202).json({ 
        message: 'Curriculum generation started.', 
        jobId,
        pollUrl: `/api/curriculum/status/${jobId}` 
      });
    } catch (error) {
      console.error('Error generating curriculum:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * GET /api/curriculum/status/:jobId
   */
  static async getJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = CurriculumOrchestrator.getJobStatus(jobId);

      if (!job) {
        res.status(404).json({ error: 'Job ID not found.' });
        return;
      }

      res.status(200).json({
        jobId: job.id,
        status: job.status,
        result: job.result,
        error: job.error
      });
    } catch (error) {
      console.error('Error fetching job status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
