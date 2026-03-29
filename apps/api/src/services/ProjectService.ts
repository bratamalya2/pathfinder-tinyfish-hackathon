import { ENV } from '../config/env';

export interface ProjectRoadmap {
  title: string;
  description: string;
  stages: {
    name: string;
    tasks: string[];
  }[];
}

export class ProjectService {
  /**
   * Generates a step-by-step project roadmap for a specific skill and career goal.
   * 
   * @param careerGoal - The target career (e.g., "Full Stack Developer")
   * @param skill - The skill to demonstrate (e.g., "React State Management")
   * @returns A structured ProjectRoadmap object
   */
  static async generateProjectRoadmap(careerGoal: string, skill: string): Promise<ProjectRoadmap> {
    console.log(`[ProjectService] Generating portfolio project roadmap for "${skill}" as a ${careerGoal}...`);

    if (ENV.USE_MOCKS) {
      console.log(`[ProjectService] 🧪 MOCK MODE: Returning project roadmap...`);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return {
        title: `Real-Time Data Dashboard (${skill})`,
        description: `A comprehensive dashboard for visualizing live data updates in a ${careerGoal} context.`,
        stages: [
          {
            name: 'Basic Setup',
            tasks: ['Initialize repository', 'Setup core UI components', 'Configure state management'],
          },
          {
            name: 'Core Logic',
            tasks: [`Integrate ${skill} implementation`, 'Connect to mock API', 'Handle loading states'],
          },
          {
            name: 'Polish & Deployment',
            tasks: ['Add animations', 'Responsive design fixes', 'Deploy to Vercel/Netlify'],
          },
        ],
      };
    }

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a career mentor. Generate a 3-stage portfolio project roadmap that demonstrates mastery of a specific skill. 
          Return a JSON object with: title, description, and an array "stages". 
          Each stage should have a "name" and an array of "tasks".`,
        },
        {
          role: 'user',
          content: `Career Goal: ${careerGoal}, Skill: ${skill}.`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content || '{}');
    return parsed as ProjectRoadmap;
  }
}
