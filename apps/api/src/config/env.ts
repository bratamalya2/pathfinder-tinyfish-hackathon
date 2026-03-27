import dotenv from 'dotenv';
import path from 'path';

// Load variables from .env file up to the monorepo root or local if present
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 4000,
  USE_MOCKS: process.env.USE_MOCKS !== 'false', // Defaults to true; set USE_MOCKS=false to use real APIs
  NEO4J_URI: process.env.NEO4J_URI || 'neo4j+s://demo.databases.neo4j.io',
  NEO4J_USER: process.env.NEO4J_USER || 'neo4j',
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || 'password',
  NEO4J_DATABASE: process.env.NEO4J_DATABASE || 'neo4j',
  TINYFISH_API_KEY: process.env.TINYFISH_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
};

// Log mock mode status
if (ENV.USE_MOCKS) {
  console.warn('⚠️  USE_MOCKS=true → Backend running with simulated Agent & LLM responses.');
  console.warn('   Set USE_MOCKS=false in .env to use real TinyFish + OpenAI APIs.');
}
