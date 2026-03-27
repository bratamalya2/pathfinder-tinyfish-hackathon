# Project Overview

**Project Name:** PathFinder (Live Curriculum Scraper & Graph Engine)
**Target Audience:** Senior K-12 students (High School Juniors/Seniors) preparing for college or entering the workforce.
**Hackathon Target:** TinyFish $2M Pre-Accelerator Hackathon

## The Problem
High school seniors looking to build specific skills (e.g., UI/UX design, introductory data science, creative writing) before college face a highly fragmented internet. Educational resources are scattered across bootcamps, community college portals, and platforms like Coursera or edX. Finding the right sequence of courses requires hours of manual searching, battling dynamic search filters, pagination, and evaluating course syllabi.

## The Solution
PathFinder is an autonomous web application that acts as a tireless educational consultant, powered by a hybrid architecture. It combines the active web-execution capabilities of the **TinyFish Web Agent API** with the intelligent memory of a **Graph Database (Neo4j)**. 

Instead of scraping blindly every time, PathFinder builds an evolving educational knowledge graph. It queries its graph first for instant curriculum generation and only dispatches the TinyFish agent to the live web to fill in missing knowledge gaps, scrape updated syllabi, or find newly released courses.

## Core Workflows
1. **User Intake:** The student inputs their current grade, target career or major (e.g., "Software Engineering"), existing skills, and budget constraints.
2. **Graph Knowledge Retrieval (The Brain):** The backend queries the Neo4j graph database to find existing paths `(Career) -> REQUIRES -> (Skills) -> TAUGHT_BY -> (Courses)`. 
3. **Agentic Dispatch (The Muscle):** If the requested path is incomplete or the data is stale, the backend constructs specific browsing missions and dispatches them to the TinyFish API to search live educational platforms, interact with search filters, and extract missing course details.
4. **Curriculum Synthesis & Storage:** An LLM processes the unstructured data retrieved by the agent. Crucially, the backend saves this newly discovered information (courses, skills, prerequisites) back into the Graph Database as nodes and edges for future use.
5. **Presentation:** The frontend displays a curated, chronological learning timeline with direct links to enroll, strictly adhering to prerequisite logic.

## The Graph Advantage (Why it Wins)
* **Intelligent Caching (Low Latency):** Bypasses the minutes-long wait times of live agents by serving previously mapped paths instantly. TinyFish is used strategically to *expand* the graph, not just repeat queries.
* **Perfect Prerequisite Mapping:** The graph natively understands dependencies (e.g., *Calculus* must precede *Machine Learning*), ensuring logically sound curriculums.
* **Smart Career Pivots:** If a student changes their mind (e.g., from *UI/UX* to *Product Management*), the graph calculates overlapping skill nodes to suggest a highly personalized, shortened transition path.