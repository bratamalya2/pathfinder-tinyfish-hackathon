# Technical Requirements

## Tech Stack
* **Frontend:** React.js (Vite or Create React App)
* **Backend:** Node.js with Express.js
* **Agent Infrastructure:** TinyFish Web Agent API
* **Knowledge Engine (Graph DB):** Neo4j (AuraDB for easy cloud hosting)
* **Data Synthesis:** OpenAI API (gpt-4o-mini) or Anthropic API (Claude 3.5 Haiku) for formatting agent output and extracting graph relationships.

## System Architecture & Data Flow

### 1. Frontend (React.js)
* **State Management:** React Context or simple state for handling the multi-step intake form and the final curriculum timeline.
* **Components:**
    * `IntakeForm`: Captures career goal, current skill level, and time availability.
    * `SmartLoadingState`: A UI that updates based on backend routing (e.g., "Checking database..." -> "Path found!" OR "Path incomplete. Dispatching web agent to Coursera...").
    * `CurriculumTimeline`: A chronological visualization of the suggested courses.
* **API Communication:** Uses `fetch` or `axios` to POST user data to the Express backend and poll for completion.

### 2. Backend (Node.js / Express.js)
* **Role:** Acts as the central orchestrator and graph manager. 
* **Endpoints:**
    * `POST /api/curriculum/generate`: Receives user criteria.
    * `GET /api/curriculum/status/:jobId`: For frontend polling during active web scraping.
* **The "Check-and-Save" Routing Logic:**
    1. **Query Graph:** Execute a Cypher query in Neo4j to find paths matching the user's career goal.
    2. **Evaluate:** Does a complete, recent path exist? 
        * *If Yes:* Return JSON immediately to frontend.
        * *If No:* Identify the missing skills/courses.
    3. **Dispatch TinyFish:** Generate prompt payloads tailored to the missing data. *(Example: "Go to edX. Search for 'Advanced React'. Extract top 3 beginner courses and their syllabi.")*
    4. **LLM Processing:** Send raw TinyFish scrape data to OpenAI/Anthropic to extract structured JSON (Course Title, URL, Skills Taught, Prerequisites).
    5. **Graph Mutation:** Save the new structured data as Nodes and Edges in Neo4j.
    6. **Return to User:** Send the completed path to the React frontend.

## Key Technical Challenges to Address
* **Graph Ontology Design:** Defining clear Node labels (`Career`, `Skill`, `Course`) and Relationship types (`REQUIRES`, `TAUGHT_BY`, `PREREQUISITE_FOR`) before coding begins.
* **Agent Fallback Logic:** The live web is brittle. If TinyFish fails to find a specific course due to a UI change on a target website, the backend must gracefully handle the error and either retry on a different site or return a partial path based on existing graph data.
* **Latency Management:** Integrating WebSockets (Socket.io) or robust polling so the frontend user doesn't face browser timeouts while the TinyFish agent performs 3-minute long scrapes.