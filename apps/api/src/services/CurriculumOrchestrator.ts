import { GraphService } from './GraphService';
import { AgentService } from './AgentService';
import { SynthesisService } from './SynthesisService';
import { MarketService } from './MarketService';
import { ProjectService } from './ProjectService';

type JobStatus = 'PENDING' | 'ANALYZING_MARKET' | 'SEARCHING_GRAPH' | 'SCRAPING_WEB' | 'SYNTHESIZING_DATA' | 'GENERATING_PROJECTS' | 'UPDATING_GRAPH' | 'COMPLETED' | 'FAILED';

export interface CurriculumJob {
  id: string;
  careerGoal: string;
  location: string;
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
  static startCurriculumGeneration(careerGoal: string, location: string, currentLevel: string): string {
    const jobId = this.generateJobId();
    const job: CurriculumJob = {
      id: jobId,
      careerGoal,
      location,
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

    // 1. Market Analysis (Scrape Job Trends)
    job.status = 'ANALYZING_MARKET';
    const rawMarketData = await MarketService.getMarketSignals(job.careerGoal, job.location);
    const trendingSkills = await SynthesisService.extractMarketSignals(rawMarketData);

    // 2. Query Graph
    job.status = 'SEARCHING_GRAPH';
    const graphResult = await GraphService.checkExistingCurriculumPath(job.careerGoal, job.currentLevel);

    let finalCourses = graphResult.existingCourses;
    let missingSkills = graphResult.missingSkills;

    // 3. Dispatch TinyFish Agent (since path is incomplete or to supplement with market data)
    if (!graphResult.pathFound) {
      job.status = 'SCRAPING_WEB';
      // Use trending skills to guide the agent!
      const skillsToSearch = [...new Set([...missingSkills, ...trendingSkills])];
      const rawAgentOutput = await AgentService.dispatchWebAgentMission(job.careerGoal, skillsToSearch);

      // 4. Process LLM Synthesis
      job.status = 'SYNTHESIZING_DATA';
      const structuredNodes = await SynthesisService.extractStructuredGraphData(rawAgentOutput);
      finalCourses = structuredNodes;

      // 5. Update the Graph
      job.status = 'UPDATING_GRAPH';
      await GraphService.saveNewCurriculumData(job.careerGoal, structuredNodes);
      await GraphService.saveMarketDemand(job.careerGoal, job.location, trendingSkills);
    }

    // 6. Generate Portfolio Projects for Top Skills
    job.status = 'GENERATING_PROJECTS';
    const topSkills = trendingSkills.slice(0, 2);
    const projects = [];
    for (const skill of topSkills) {
      const project = await ProjectService.generateProjectRoadmap(job.careerGoal, skill);
      await GraphService.saveProjectRoadmap(skill, project);
      projects.push(project);
    }

    // 7. Complete Job
    job.status = 'COMPLETED';
    job.result = {
      source: graphResult.pathFound ? 'cache' : 'live-scrape',
      marketTrends: trendingSkills,
      courses: finalCourses,
      suggestedProjects: projects,
    };
    console.log(`[Orchestrator] Job ${jobId} completed successfully!`);
  }
}
