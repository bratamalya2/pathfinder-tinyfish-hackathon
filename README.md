# PathFinder Monorepo 🧭

PathFinder is an autonomous educational researcher that generates personalized, prerequisite-aware learning paths. It uses **TinyFish Web Agents** to scrape live course data from platforms like Coursera and Udemy, then synthesizes it into an evolving **Neo4j Knowledge Graph**.

---

## 🛠 Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **pnpm** (Required for monorepo workspace management)
- **Neo4j AuraDB** (A free cloud instance is recommended)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd pathfinder
pnpm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory. You can use the existing `.env` as a template. Ensure the following mandatory keys are provided:

```env
# API Server Configuration
PORT=4000

# API Credentials (CRITICAL)
TINYFISH_API_KEY=your_sk_tinyfish_key_here
OPENAI_API_KEY=your_sk_openai_key_here

# Neo4j Database (AuraDB)
NEO4J_URI=neo4j+s://your-db-id.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_secure_password
NEO4J_DATABASE=neo4j
```

> [!IMPORTANT]
> - **OpenAI API Key**: Used by `SynthesisService` to parse unstructured web data into structured graph nodes.
> - **TinyFish API Key**: Used by `AgentService` to dispatch autonomous web agents for course discovery.
> - **Neo4j**: Ensure your AuraDB instance is active and reachable.

### 3. Run Development Servers
Start both the Frontend (Vite) and Backend (Express) concurrently:
```bash
pnpm dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)
- **Health Check**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## 📂 Project Structure

- `apps/api`: Express server orchestrating the Hybrid Graph-LLM workflow.
- `apps/web`: React (Vite) frontend with a premium, animated user experience.
- `packages/`: (Optional) Shared utilities and types across the monorepo.

---

## 🧪 Verification & Testing
To run tests across all workspaces:
```bash
pnpm test
```

To build for production:
```bash
pnpm build
```
