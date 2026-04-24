# Gemini Prompt Architect (GPA) - Core Engine

## What is this?
This repository hosts the decoupled JavaScript engine (`gpa-engine.js`) for the **Gemini Prompt Architect**. 

## Why is it here?
To bypass the strict output token limits of LLMs like Gemini 3.1 Pro.
By hosting the heavy UI generation, diffing logic, and HTML/CSS boilerplate externally, the AI only needs to output a lightweight "Hollow Shell" JSON payload.
This prevents the Canvas environment from truncating the code and crashing.

## How it works
1. The AI generates a lightweight HTML file containing a JSON data block (`#app-state`).
2. That HTML file reaches out to this repository and loads `gpa-engine.js`.
3. This script parses the AI's data, dynamically builds the Tailwind UI, and injects the optimized prompt into the Canvas iframe.
