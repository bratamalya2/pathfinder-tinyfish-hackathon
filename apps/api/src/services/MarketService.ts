import { ENV } from '../config/env';

export class MarketService {
  /**
   * Dispatches a mission to the TinyFish Web Agent API to search for job market signals
   * 
   * @param careerGoal - The user's target career (e.g., "Software Engineer")
   * @param location - The user's geography (e.g., "Bangalore, India")
   * @returns The raw unstructured data about market demand and top skills
   */
  static async getMarketSignals(careerGoal: string, location: string): Promise<string> {
    const jobBoardGoal = `You are a job market researcher. I need you to find the most in-demand skills and technologies for a ${careerGoal} in ${location}. 
    Navigate to job boards like Indeed, LinkedIn, or local equivalents. Extract the top 5 most frequently mentioned technical skills, frameworks, or tools in recent job descriptions. 
    If you cannot find specific job listings, search for industry reports or hiring trend articles for ${careerGoal} in ${location}.
    Return your findings as a structured list of skills with brief descriptions of why they are in demand.`;

    console.log(`[MarketService] Dispatching TinyFish Market Researcher Mission for ${careerGoal} in ${location}...`);

    if (ENV.USE_MOCKS) {
      console.log(`[MarketService] 🧪 MOCK MODE: Simulating market research...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return `
        --- RAW MARKET DATA ---
        Based on job postings for ${careerGoal} in ${location}:
        1. React: Mentioned in 85% of listings.
        2. Node.js: Critical for backend roles.
        3. TypeScript: High demand for large-scale projects.
        4. Docker: Required for deployment and environment consistency.
        5. PostgreSQL: Most common database requirement.
      `;
    }

    // Call TinyFish API
    const response = await fetch('https://agent.tinyfish.ai/v1/automation/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENV.TINYFISH_API_KEY,
      },
      body: JSON.stringify({
        url: 'https://www.google.com/search?q=jobs+for+' + encodeURIComponent(careerGoal) + '+in+' + encodeURIComponent(location),
        goal: jobBoardGoal,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[MarketService] TinyFish API error: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`TinyFish Market API error: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    return typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
  }
}
