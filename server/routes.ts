import type { Express } from "express";
import { createServer, type Server } from "http";
import { GoogleGenAI } from "@google/genai";
import { projectPlanSchema, projectInputSchema } from "@shared/schema";
import { ZodError } from "zod";

// DON'T DELETE THIS COMMENT
// Using Gemini AI blueprint integration
// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Project planning endpoint with Gemini AI
  app.post("/api/plan-project", async (req, res) => {
    try {
      // Validate input
      const { projectDescription } = projectInputSchema.parse(req.body);

      // Construct prompt for Gemini AI
      const prompt = `
You are an expert project planner and cost estimator for home improvement projects.

Analyze the user's project request and generate a comprehensive project plan. Follow a "Plan-and-Solve" approach. First, devise a plan for your research. Second, execute that plan to generate the final output covering:
1. A list of all materials and tools required with realistic quantities and costs.
2. A detailed cost analysis for materials and typical labor rates in Chesterfield County, Virginia.
3. A logical, step-by-step execution guide with clear instructions.
4. Specific regulations for construction debris disposal in Chesterfield County, Virginia, including actual landfill options with addresses.

User's Project Request: "${projectDescription}"
Location for Analysis: Chesterfield County, Virginia

IMPORTANT: Respond ONLY with a single, valid JSON object that adheres to the following schema. Do not include markdown, explanations, or any other text before or after the JSON.

Schema:
{
  "projectName": "string (concise project title)",
  "materials": [
    {
      "item": "string (material or tool name)",
      "quantity": "string (e.g., '10 pieces', '2 gallons')",
      "estimatedCost": number (cost in USD)
    }
  ],
  "costAnalysis": {
    "totalMaterialsCost": number (sum of all material costs),
    "estimatedLaborCost": number (typical labor cost for this project),
    "totalProjectCost": number (materials + labor)
  },
  "executionSteps": [
    "string (detailed step-by-step instruction)"
  ],
  "disposalInfo": {
    "regulationsSummary": "string (summary of local disposal regulations)",
    "landfillOptions": [
      {
        "name": "string (facility name)",
        "address": "string (full address)"
      }
    ]
  }
}

Generate the JSON response now:
`;

      // Call Gemini AI with properly structured content
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      // Check if response has candidates
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No response candidates from AI. Please try again.");
      }

      const text = response.text;

      if (!text) {
        throw new Error("Empty response from AI. Please try again.");
      }

      // Extract JSON from response (handle potential markdown wrapping)
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      // Parse and validate the response
      const parsedData = JSON.parse(jsonText);
      const validatedPlan = projectPlanSchema.parse(parsedData);

      // Additional safety check
      if (!validatedPlan.costAnalysis || !validatedPlan.materials || !validatedPlan.executionSteps) {
        throw new Error("AI response is missing required fields. Please try again.");
      }

      res.json(validatedPlan);
    } catch (error) {
      console.error("Error generating project plan:", error);

      // Log the actual error for debugging
      if (error && typeof error === 'object' && 'message' in error) {
        console.error("Error details:", JSON.stringify(error, null, 2));
      }

      if (error instanceof ZodError) {
        console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({
          error: "AI response validation failed. Please try again with a different description.",
          details: error.errors,
        });
      }

      if (error instanceof SyntaxError) {
        return res.status(500).json({
          error: "Failed to parse AI response. The AI service may be experiencing issues. Please try again.",
        });
      }

      // Handle Gemini API specific errors
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      if (errorMessage.includes("overloaded") || errorMessage.includes("UNAVAILABLE")) {
        return res.status(503).json({
          error: "The AI service is currently overloaded. Please try again in a moment.",
        });
      }

      res.status(500).json({
        error: errorMessage || "Failed to generate project plan. Please try again.",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
