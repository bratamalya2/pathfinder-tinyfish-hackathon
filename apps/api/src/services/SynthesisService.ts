import { ENV } from '../config/env';
import { CourseNode } from './GraphService';

export class SynthesisService {
  /**
   * Sends unstructured web scrape data to an LLM to parse into perfect JSON nodes
   *
   * @param rawAgentOutput Unstructured text from the Web Agent
   * @return An array of standardized CourseNode objects
   */
  static async extractStructuredGraphData(rawAgentOutput: string): Promise<CourseNode[]> {
    console.log(`[SynthesisService] Processing unstructured web data with OpenAI/LLM...`);

    // Use mock responses when USE_MOCKS is enabled
    if (ENV.USE_MOCKS) {
      console.log(`[SynthesisService] 🧪 MOCK MODE: Returning predefined course nodes...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return [
        {
          title: 'Complete React Developer',
          url: 'https://udemy.com/mock-react',
          provider: 'Udemy',
          difficulty: 'Beginner',
        },
        {
          title: 'Advanced State Management',
          url: 'https://frontendmasters.com/mock-state',
          provider: 'FrontendMasters',
          difficulty: 'Advanced',
        },
      ];
    }

    // Real OpenAI API integration
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a data extractor. Convert the following disorganized web scraped text into a JSON object with a key "courses" containing an array. Each object in the array has fields: title, url, provider, and difficulty.' },
        { role: 'user', content: rawAgentOutput }
      ]
    });
    const parsed = JSON.parse(completion.choices[0].message.content || '{"courses": []}');
    return parsed.courses as CourseNode[];
  }

  /**
   * Extract structured market demand signals from recruiter-style agent output.
   */
  static async extractMarketSignals(rawMarketOutput: string): Promise<string[]> {
    console.log(`[SynthesisService] Processing market data with OpenAI/LLM...`);

    if (ENV.USE_MOCKS) {
      console.log(`[SynthesisService] 🧪 MOCK MODE: Returning market signals...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return ['React', 'Node.js', 'TypeScript', 'Docker', 'PostgreSQL'];
    }

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a job market analyst. Extract the most important technical skills mentioned in the following text. Return a JSON object with a key "skills" which is an array of strings (the skill names).' },
        { role: 'user', content: rawMarketOutput }
      ]
    });
    const parsed = JSON.parse(completion.choices[0].message.content || '{"skills": []}');
    return parsed.skills as string[];
  }
}
