import { GraphService } from './GraphService';
import { AgentService } from './AgentService';
import { SynthesisService } from './SynthesisService';

type JobStatus = 'PENDING' | 'SEARCHING_GRAPH' | 'SCRAPING_WEB' | 'SYNTHESIZING_DATA' | 'UPDATING_GRAPH' | 'COMPLETED' | 'FAILED';

export interface CurriculumJob {
  id: string;
  careerGoal: string;
  currentLevel: string;
  status: JobStatus;
  result?: any;
  error?: string;
}

// In-memory store for async background jobs
const jobStore = new Map<string, CurriculumJob>();

export class CurriculumOrchestrator {
  /**
   * Generates a unique Job ID
   */
  private static generateJobId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Retrieves a job by ID
   */
  static getJobStatus(jobId: string): CurriculumJob | undefined {
    return jobStore.get(jobId);
  }

  /**
   * Starts the "Check-and-Save" process asynchronously and returns a job ID
   */
  static startCurriculumGeneration(careerGoal: string, currentLevel: string): string {
    const jobId = this.generateJobId();
    const job: CurriculumJob = {
      id: jobId,
      careerGoal,
      currentLevel,
      status: 'PENDING',
    };
    jobStore.set(jobId, job);

    // Fire and forget: Runs the pipeline in the background
    this.processCurriculumPipeline(jobId)
      .catch((err) => {
        console.error(`[Orchestrator] Job ${jobId} failed:`, err);
        const failedJob = jobStore.get(jobId);
        if (failedJob) {
          failedJob.status = 'FAILED';
          failedJob.error = err instanceof Error ? err.message : 'Unknown error occurred';
        }
      });

    return jobId;
  }

  /**
   * The core Hybrid Workflow logic implementation
   */
  private static async processCurriculumPipeline(jobId: string) {
    const job = jobStore.get(jobId);
    if (!job) throw new Error('Job not found');

    // 1. Query Graph
    job.status = 'SEARCHING_GRAPH';
    const graphResult = await GraphService.checkExistingCurriculumPath(job.careerGoal, job.currentLevel);

    if (graphResult.pathFound) {
      // Fast path: Data already exists in the graph!
      job.status = 'COMPLETED';
      job.result = { source: 'cache', data: graphResult.existingCourses };
      return;
    }

    // 2. Dispatch TinyFish Agent (since path is incomplete)
    job.status = 'SCRAPING_WEB';
    const rawAgentOutput = await AgentService.dispatchWebAgentMission(job.careerGoal, graphResult.missingSkills);

    // 3. Process LLM Synthesis
    job.status = 'SYNTHESIZING_DATA';
    const structuredNodes = await SynthesisService.extractStructuredGraphData(rawAgentOutput);

    // 4. Update the Graph
    job.status = 'UPDATING_GRAPH';
    const saved = await GraphService.saveNewCurriculumData(job.careerGoal, structuredNodes);

    if (!saved) throw new Error('Failed to save structured data back to the graph.');

    // 5. Complete Job
    job.status = 'COMPLETED';
    job.result = { source: 'live-scrape', data: structuredNodes };
    console.log(`[Orchestrator] Job ${jobId} completed successfully!`);
  }
}
