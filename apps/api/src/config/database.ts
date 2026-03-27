import neo4j, { Driver } from 'neo4j-driver';
import { ENV } from './env';

let driver: Driver;

export function initDatabase() {
  try {
    driver = neo4j.driver(ENV.NEO4J_URI, neo4j.auth.basic(ENV.NEO4J_USER, ENV.NEO4J_PASSWORD));
    console.log('✅ Connected to Neo4j successfully (Driver Initialized)');
  } catch (err) {
    console.error('❌ Failed to create Neo4j Driver', err);
  }
}

export function getDatabaseDriver() {
  if (!driver) {
    throw new Error('Neo4j Driver not initialized. Call initDatabase() first.');
  }
  return driver;
}

export async function closeDatabase() {
  if (driver) {
    await driver.close();
  }
}
