import { Record as Neo4jRecord } from 'neo4j-driver';
import { getDatabaseDriver } from '../config/database';
import { ENV } from '../config/env';

export interface CourseNode {
  title: string;
  url: string;
  provider: string;
  difficulty: string;
}

export interface SkillNode {
  name: string;
}

export class GraphService {
  /**
   * Checks if a complete curriculum path already exists in Neo4j for a given career goal + level.
   * Returns any existing courses and identifies missing skills that still need scraping.
   */
  static async checkExistingCurriculumPath(careerGoal: string, currentLevel: string) {
    const driver = getDatabaseDriver();
    const session = driver.session({ database: ENV.NEO4J_DATABASE });

    try {
      console.log(`[GraphService] Checking graph for career="${careerGoal}", level="${currentLevel}"...`);

      // Look for an existing Career node and its connected courses
      // Note: We don't filter by difficulty here — currentLevel is used to guide
      // the agent's initial search, not to restrict cached results.
      const result = await session.run(
        `
        MATCH (c:Career {name: $careerGoal})-[:REQUIRES]->(s:Skill)-[:TAUGHT_BY]->(course:Course)
        RETURN course.title AS title, course.url AS url,
               course.provider AS provider, course.difficulty AS difficulty,
               s.name AS skillName
        `,
        { careerGoal }
      );

      if (result.records.length > 0) {
        // We found existing courses in the graph
        const existingCourses: CourseNode[] = result.records.map((r: Neo4jRecord) => ({
          title: r.get('title'),
          url: r.get('url'),
          provider: r.get('provider'),
          difficulty: r.get('difficulty'),
        }));

        const existingSkills = [...new Set(result.records.map((r: Neo4jRecord) => r.get('skillName') as string))];
        console.log(`[GraphService] Found ${existingCourses.length} cached courses for "${careerGoal}" (skills: ${existingSkills.join(', ')})`);

        return {
          pathFound: true,
          missingSkills: [] as string[],
          existingCourses,
        };
      }

      // No path found — determine "missing skills" from a simpler check
      // (since there's nothing in the graph yet, everything is missing)
      console.log(`[GraphService] No existing path found for "${careerGoal}". Full scrape needed.`);
      return {
        pathFound: false,
        missingSkills: this.inferMissingSkillsForGoal(careerGoal, currentLevel),
        existingCourses: [] as CourseNode[],
      };
    } catch (err) {
      console.error('[GraphService] Cypher query error during check:', err);
      // Gracefully degrade — treat as empty graph so pipeline continues
      return {
        pathFound: false,
        missingSkills: this.inferMissingSkillsForGoal(careerGoal, currentLevel),
        existingCourses: [] as CourseNode[],
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Infers a reasonable set of "missing skills" based on the career goal and level,
   * so the web agent knows what to search for. This acts as a heuristic seed
   * when no graph data exists yet.
   */
  private static inferMissingSkillsForGoal(careerGoal: string, currentLevel: string): string[] {
    const goal = careerGoal.toLowerCase();

    // Level prefix — helps TinyFish search for the right difficulty
    const levelHint = currentLevel ? `${currentLevel} ` : '';

    // Map common career goals to relevant skill clusters
    const skillMap: Record<string, string[]> = {
      'data scientist': [`${levelHint}Python for Data Science`, `${levelHint}Machine Learning`, `${levelHint}Statistics & Probability`, `${levelHint}Data Visualization`],
      'data science': [`${levelHint}Python for Data Science`, `${levelHint}Machine Learning`, `${levelHint}Statistics & Probability`, `${levelHint}Data Visualization`],
      'machine learning engineer': [`${levelHint}Deep Learning`, `${levelHint}MLOps`, `${levelHint}TensorFlow / PyTorch`, `${levelHint}Linear Algebra`],
      'frontend developer': [`${levelHint}HTML & CSS`, `${levelHint}JavaScript`, `${levelHint}React`, `${levelHint}Responsive Web Design`],
      'frontend engineer': [`${levelHint}HTML & CSS`, `${levelHint}JavaScript`, `${levelHint}React`, `${levelHint}Responsive Web Design`],
      'backend developer': [`${levelHint}Node.js`, `${levelHint}REST API Design`, `${levelHint}Databases`, `${levelHint}System Design`],
      'backend engineer': [`${levelHint}Node.js`, `${levelHint}REST API Design`, `${levelHint}Databases`, `${levelHint}System Design`],
      'full stack developer': [`${levelHint}React`, `${levelHint}Node.js`, `${levelHint}Databases`, `${levelHint}DevOps Fundamentals`],
      'fullstack developer': [`${levelHint}React`, `${levelHint}Node.js`, `${levelHint}Databases`, `${levelHint}DevOps Fundamentals`],
      'software engineer': [`${levelHint}Data Structures & Algorithms`, `${levelHint}System Design`, `${levelHint}Object-Oriented Programming`, `${levelHint}Software Architecture`],
      'devops engineer': [`${levelHint}Docker & Kubernetes`, `${levelHint}CI/CD Pipelines`, `${levelHint}Cloud Platforms (AWS/GCP)`, `${levelHint}Infrastructure as Code`],
      'mobile developer': [`${levelHint}React Native`, `${levelHint}iOS Development`, `${levelHint}Android Development`, `${levelHint}Mobile UI/UX`],
      'cybersecurity analyst': [`${levelHint}Network Security`, `${levelHint}Ethical Hacking`, `${levelHint}Cryptography`, `${levelHint}Security Compliance`],
      'cloud architect': [`${levelHint}AWS / Azure / GCP`, `${levelHint}Cloud Networking`, `${levelHint}Serverless Architecture`, `${levelHint}Cost Optimization`],
      'ui/ux designer': [`${levelHint}Design Thinking`, `${levelHint}Figma`, `${levelHint}User Research`, `${levelHint}Prototyping`],
      'product manager': [`${levelHint}Product Strategy`, `${levelHint}User Story Mapping`, `${levelHint}Agile / Scrum`, `${levelHint}Metrics & Analytics`],
    };

    // Try to match
    for (const [key, skills] of Object.entries(skillMap)) {
      if (goal.includes(key)) {
        return skills;
      }
    }

    // Generic fallback — let the agent figure it out
    return [
      `${levelHint}Core skills for ${careerGoal}`,
      `${levelHint}Fundamentals of ${careerGoal}`,
      `${levelHint}Advanced topics in ${careerGoal}`,
    ];
  }

  /**
   * Persists newly scraped course data into Neo4j as a Career→Skill→Course graph.
   */
  static async saveNewCurriculumData(careerGoal: string, newCourses: CourseNode[]) {
    const driver = getDatabaseDriver();
    const session = driver.session({ database: ENV.NEO4J_DATABASE });

    try {
      console.log(`[GraphService] Saving ${newCourses.length} courses for "${careerGoal}" to Neo4j...`);

      // 1. MERGE the Career node
      await session.run(
        `MERGE (c:Career {name: $careerGoal})
         ON CREATE SET c.createdAt = datetime()
         RETURN c`,
        { careerGoal }
      );

      // 2. For each course, create Skill + Course nodes and link them
      for (const course of newCourses) {
        // Derive a skill name from the course title (simple heuristic)
        const skillName = this.deriveSkillName(course.title);

        await session.run(
          `
          MATCH (c:Career {name: $careerGoal})
          MERGE (s:Skill {name: $skillName})
          MERGE (c)-[:REQUIRES]->(s)
          MERGE (course:Course {title: $title})
          ON CREATE SET course.url = $url,
                        course.provider = $provider,
                        course.difficulty = $difficulty,
                        course.createdAt = datetime()
          ON MATCH SET  course.url = $url,
                        course.provider = $provider,
                        course.difficulty = $difficulty
          MERGE (s)-[:TAUGHT_BY]->(course)
          `,
          {
            careerGoal,
            skillName,
            title: course.title,
            url: course.url,
            provider: course.provider,
            difficulty: course.difficulty,
          }
        );
      }

      console.log(`[GraphService] ✅ Successfully saved ${newCourses.length} courses to Neo4j graph.`);
      return true;
    } catch (err) {
      console.error('[GraphService] ❌ Failed to save curriculum data:', err);
      return false;
    } finally {
      await session.close();
    }
  }

  /**
   * Persists market demand skills for a specific career and location.
   */
  static async saveMarketDemand(careerGoal: string, location: string, skills: string[]) {
    const driver = getDatabaseDriver();
    const session = driver.session({ database: ENV.NEO4J_DATABASE });

    try {
      console.log(`[GraphService] Saving market demand for "${careerGoal}" in "${location}"...`);

      for (const skillName of skills) {
        await session.run(
          `
          MATCH (c:Career {name: $careerGoal})
          MERGE (m:MarketDemand {location: $location, skill: $skillName})
          MERGE (c)-[:TRENDING_IN]->(m)
          ON CREATE SET m.updatedAt = datetime()
          ON MATCH SET m.updatedAt = datetime()
          `,
          { careerGoal, location, skillName }
        );
      }
      return true;
    } catch (err) {
      console.error('[GraphService] Failed to save market demand:', err);
      return false;
    } finally {
      await session.close();
    }
  }

  /**
   * Links a project roadmap to a skill.
   */
  static async saveProjectRoadmap(skillName: string, project: any) {
    const driver = getDatabaseDriver();
    const session = driver.session({ database: ENV.NEO4J_DATABASE });

    try {
      await session.run(
        `
        MATCH (s:Skill {name: $skillName})
        MERGE (p:Project {title: $title})
        SET p.description = $description,
            p.roadmap = $roadmap,
            p.updatedAt = datetime()
        MERGE (s)-[:PRACTICE_WITH]->(p)
        `,
        {
          skillName,
          title: project.title,
          description: project.description,
          roadmap: JSON.stringify(project.stages),
        }
      );
      return true;
    } catch (err) {
      console.error('[GraphService] Failed to save project roadmap:', err);
      return false;
    } finally {
      await session.close();
    }
  }

  /**
   * Derives a skill/topic name from a course title.
   * e.g. "Complete React Developer Course" → "React Developer"
   */
  private static deriveSkillName(courseTitle: string): string {
    // Strip common filler words to get a cleaner skill name
    const filler = /\b(complete|the|a|an|course|masterclass|bootcamp|certification|intro to|introduction to|fundamentals of|advanced|beginner|intermediate)\b/gi;
    let skill = courseTitle.replace(filler, '').replace(/\s+/g, ' ').trim();
    // If we stripped too much, fall back to the original title
    if (skill.length < 3) skill = courseTitle;
    return skill;
  }
}
