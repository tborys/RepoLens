
import { GoogleGenAI, Type } from "@google/genai";
import { HealthModel, AIAnalysis } from '../types';

export async function summarizeRepoHealth(model: HealthModel): Promise<AIAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As a World-Class Senior Staff Engineer, provide a clinical technical assessment of this repository.
    
    Repo: "${model.repo.name}" (${model.runtime.language})
    Architecture Patterns: ${model.architecture.patterns.join(', ')}
    API Inventory: ${model.apiInventory.endpoints.length} resolved endpoints.
    Resolved Routes Sample: ${JSON.stringify(model.apiInventory.endpoints.slice(0, 10))}
    Test Posture: ${model.testPosture.signal}
    Dependencies: ${model.dependencies.length} entries.
    Docs Health: ${JSON.stringify(model.docsHealth)}

    STRICT WRITING STYLE RULES:
    - Tone: Professional, calm and clear.
    - Voice: Straightforward and direct. Avoid labels like "Context", "What/How/Why", or "Next Steps".
    - British English: Use British spelling such as optimise and normalisation.
    - Punctuation: Do not use a comma before and. Do not use hyphens in the middle of sentences.
    - Formatting: Bold key phrases. Use short paragraphs. Use lists for more than two items.

    REQUIRED ANALYSIS:
    1. Behavioural summary: Define the core business purpose of this software.
    2. Executive Summary: A factual technical audit of the current state.
    3. Architecture Deep-Dive: A detailed explanation of component interaction and system flow based on patterns like ${model.architecture.patterns.join(', ')}.
    4. API Intelligence: Evaluate the design of detected routes. Identify RESTful compliance and potential security risks in methods like POST or DELETE. Mention WebSocket presence if detected.
    5. Dependency Analysis: Identify technical risk and version lag.
    6. Action Items: Factual, prioritised steps for health improvement.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: 'Output strictly JSON. Follow the Writing Style Guide: professional tone, British English, no Oxford commas, no mid-sentence hyphens. Avoid all structural labels in the output text.',
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          behavioralSummary: { type: Type.STRING },
          executiveSummary: { type: Type.STRING },
          riskPrioritization: { type: Type.ARRAY, items: { type: Type.STRING } },
          architecturalExplanation: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          dependencyInsights: {
            type: Type.OBJECT,
            properties: {
              outdated: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    current: { type: Type.STRING },
                    latest: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  },
                  required: ["name", "current", "latest", "impact"]
                }
              }
            },
            required: ["outdated"]
          }
        },
        required: ["behavioralSummary", "executiveSummary", "riskPrioritization", "architecturalExplanation", "recommendations", "dependencyInsights"]
      }
    },
  });

  return JSON.parse(response.text);
}
