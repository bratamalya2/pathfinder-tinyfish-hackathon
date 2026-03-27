import { ENV } from '../config/env';

export class AgentService {
  /**
   * Dispatches a mission to the TinyFish Web Agent API to search for courses
   *
   * @param careerGoal - The user's target career (e.g., "Software Engineer")
   * @param missingSkills - Skills that are completely missing from the Neo4j graph for this path
   * @return The raw unstructured text/HTML output scraped by the agent
   */
  static async dispatchWebAgentMission(careerGoal: string, missingSkills: string[]): Promise<string> {
    const goal = `You are an educational researcher. I need you to find courses online for a ${careerGoal}. Focus on finding high-quality introductory or intermediate courses that teach: ${missingSkills.join(', ')}. Extract the course titles, URLs, provider organization, and difficulty level. Return all findings as structured text.`;

    console.log(`[AgentService] Dispatching TinyFish Web Agent Mission...`);

    // Use mock responses when USE_MOCKS is enabled
    if (ENV.USE_MOCKS) {
      console.log(`[AgentService] 🧪 MOCK MODE: Simulating 2 second agent scraping...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return `
        --- RAW AGENT OUTPUT ---
        I visited Coursera and searched for ${missingSkills.join(' and ')}.
        Found: "Complete React Developer" by Udemy (Difficulty: Beginner) - https://udemy.com/mock-react
        Found: "Advanced State Management" by FrontendMasters (Difficulty: Advanced) - https://frontendmasters.com/mock-state
      `;
    }

    // Real TinyFish API integration
    // Docs: POST https://agent.tinyfish.ai/v1/automation/run (synchronous)
    // Auth: X-API-Key header
    // Body: { url, goal }
    console.log(`[AgentService] 🌐 LIVE MODE: Calling TinyFish API...`);
    const response = await fetch('https://agent.tinyfish.ai/v1/automation/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENV.TINYFISH_API_KEY,
      },
      body: JSON.stringify({
        url: 'https://www.coursera.org',
        goal: goal,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[AgentService] TinyFish API error: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`TinyFish API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data: any = await response.json();
    console.log(`[AgentService] TinyFish response status: ${data.status}`);
    return typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
  }
}
