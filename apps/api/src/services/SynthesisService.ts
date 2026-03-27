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
}
