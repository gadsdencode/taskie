import type { Express } from "express";
import { createServer, type Server } from "http";
import { GoogleGenAI } from "@google/genai";
import { projectPlanSchema, projectInputSchema } from "@shared/schema";
import { ZodError } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";

// DON'T DELETE THIS COMMENT
// Using Gemini AI blueprint integration
// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project planning endpoint with Gemini AI (now requires auth and saves to DB)
  app.post("/api/plan-project", isAuthenticated, async (req: any, res) => {
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

      // Save to database
      const userId = req.user.claims.sub;
      const savedProject = await storage.createProjectPlan(userId, projectDescription, validatedPlan);

      res.json({
        ...validatedPlan,
        id: savedProject.id,
        createdAt: savedProject.createdAt,
      });
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

  // Create a pending project and immediately return ID
  app.post("/api/projects/create", isAuthenticated, async (req: any, res) => {
    try {
      const { projectDescription } = projectInputSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Create a pending project immediately
      const project = await storage.createPendingProject(userId, projectDescription);
      
      res.json({
        id: project.id,
        status: project.status,
        createdAt: project.createdAt,
      });
    } catch (error) {
      console.error("Error creating pending project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Generate plan for an existing pending project
  app.post("/api/projects/:id/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = req.params.id;
      
      // Get the project to verify it exists and get the description
      const project = await storage.getProjectPlan(projectId, userId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.status !== "pending") {
        return res.status(400).json({ error: "Project plan already generated" });
      }

      // Update status to generating
      await storage.updateProjectWithPlan(projectId, userId, { 
        projectName: "Generating...",
        materials: [],
        costAnalysis: { totalMaterialsCost: 0, estimatedLaborCost: 0, totalProjectCost: 0 },
        executionSteps: [],
        disposalInfo: { regulationsSummary: "", landfillOptions: [] }
      }, "generating");

      // Construct prompt for Gemini AI
      const prompt = `
You are an expert project planner and cost estimator for home improvement projects.

Analyze the user's project request and generate a comprehensive project plan. Follow a "Plan-and-Solve" approach. First, devise a plan for your research. Second, execute that plan to generate the final output covering:
1. A list of all materials and tools required with realistic quantities and costs.
2. A detailed cost analysis for materials and typical labor rates in Chesterfield County, Virginia.
3. A logical, step-by-step execution guide with clear instructions.
4. Specific regulations for construction debris disposal in Chesterfield County, Virginia, including actual landfill options with addresses.

User's Project Request: "${project.projectDescription}"
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

      // Call Gemini AI
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
        // Update status to failed
        await storage.updateProjectWithPlan(projectId, userId, {
          projectName: "Generation Failed",
          materials: [],
          costAnalysis: { totalMaterialsCost: 0, estimatedLaborCost: 0, totalProjectCost: 0 },
          executionSteps: [],
          disposalInfo: { regulationsSummary: "", landfillOptions: [] }
        }, "failed");
        throw new Error("No response candidates from AI. Please try again.");
      }

      const text = response.text;

      if (!text) {
        // Update status to failed
        await storage.updateProjectWithPlan(projectId, userId, {
          projectName: "Generation Failed",
          materials: [],
          costAnalysis: { totalMaterialsCost: 0, estimatedLaborCost: 0, totalProjectCost: 0 },
          executionSteps: [],
          disposalInfo: { regulationsSummary: "", landfillOptions: [] }
        }, "failed");
        throw new Error("Empty response from AI. Please try again.");
      }

      // Extract JSON from response
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

      // Update the project with the generated plan
      const updatedProject = await storage.updateProjectWithPlan(
        projectId,
        userId,
        validatedPlan,
        "completed"
      );

      res.json(updatedProject);
    } catch (error) {
      console.error("Error generating project plan:", error);

      // Log the actual error for debugging
      if (error && typeof error === 'object' && 'message' in error) {
        console.error("Error details:", JSON.stringify(error, null, 2));
      }

      if (error instanceof ZodError) {
        console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
        
        // Update status to failed
        const userId = (req as any).user.claims.sub;
        await storage.updateProjectWithPlan((req as any).params.id, userId, {
          projectName: "Validation Failed",
          materials: [],
          costAnalysis: { totalMaterialsCost: 0, estimatedLaborCost: 0, totalProjectCost: 0 },
          executionSteps: [],
          disposalInfo: { regulationsSummary: "", landfillOptions: [] }
        }, "failed");
        
        return res.status(400).json({
          error: "AI response validation failed. Please try again with a different description.",
          details: error.errors,
        });
      }

      if (error instanceof SyntaxError) {
        // Update status to failed
        const userId = (req as any).user.claims.sub;
        await storage.updateProjectWithPlan((req as any).params.id, userId, {
          projectName: "Parse Failed",
          materials: [],
          costAnalysis: { totalMaterialsCost: 0, estimatedLaborCost: 0, totalProjectCost: 0 },
          executionSteps: [],
          disposalInfo: { regulationsSummary: "", landfillOptions: [] }
        }, "failed");
        
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

  // Get user's project history
  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjectPlans(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get specific project
  app.get("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const project = await storage.getProjectPlan(req.params.id, userId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteProjectPlan(req.params.id, userId);
      
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Export project as PDF
  app.get("/api/projects/:id/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const project = await storage.getProjectPlan(req.params.id, userId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Generate PDF
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
      
      const planData = project.planData as any;
      let page = pdfDoc.addPage([612, 792]); // Letter size
      let yPosition = 720; // Start below header
      const margin = 50;
      const pageWidth = 612;
      const contentWidth = pageWidth - (margin * 2);
      const headerHeight = 60;
      
      // Helper to draw page header
      const drawPageHeader = (currentPage: any, pageNumber: number) => {
        currentPage.drawText(project.projectName, {
          x: margin,
          y: 762,
          size: 11,
          font: timesRomanBoldFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        currentPage.drawLine({
          start: { x: margin, y: 752 },
          end: { x: pageWidth - margin, y: 752 },
          thickness: 0.5,
          color: rgb(0.7, 0.7, 0.7),
        });
      };
      
      // Helper to add new page if needed
      const checkPageSpace = (neededSpace: number) => {
        if (yPosition - neededSpace < 50) {
          const pageNumber = pdfDoc.getPages().length + 1;
          page = pdfDoc.addPage([612, 792]);
          yPosition = 720; // Reset below header
          drawPageHeader(page, pageNumber);
        }
      };
      
      // Draw header on first page
      drawPageHeader(page, 1);
      
      // Title (only on first page - not repeated in header)
      page.drawText(project.projectName, {
        x: margin,
        y: yPosition,
        size: 22,
        font: timesRomanBoldFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      yPosition -= 35;
      
      // Description
      const descriptionLines = wrapText(project.projectDescription, contentWidth, 11, timesRomanFont);
      for (const line of descriptionLines) {
        checkPageSpace(20);
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: 11,
          font: timesRomanFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 16;
      }
      yPosition -= 10;
      
      // Cost Analysis
      checkPageSpace(100);
      page.drawText("Cost Analysis", {
        x: margin,
        y: yPosition,
        size: 18,
        font: timesRomanBoldFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      yPosition -= 30;
      
      const costData = [
        { label: "Materials Cost:", value: `$${planData.costAnalysis?.totalMaterialsCost?.toLocaleString() || '0'}` },
        { label: "Labor Cost:", value: `$${planData.costAnalysis?.estimatedLaborCost?.toLocaleString() || '0'}` },
        { label: "Total Project Cost:", value: `$${planData.costAnalysis?.totalProjectCost?.toLocaleString() || '0'}` },
      ];
      
      for (const item of costData) {
        checkPageSpace(25);
        page.drawText(item.label, {
          x: margin,
          y: yPosition,
          size: 12,
          font: timesRomanFont,
        });
        page.drawText(item.value, {
          x: margin + 200,
          y: yPosition,
          size: 12,
          font: courierFont,
          color: rgb(0, 0.4, 0.2),
        });
        yPosition -= 20;
      }
      yPosition -= 15;
      
      // Materials
      if (planData.materials && planData.materials.length > 0) {
        checkPageSpace(50);
        page.drawText("Materials & Tools", {
          x: margin,
          y: yPosition,
          size: 18,
          font: timesRomanBoldFont,
          color: rgb(0.1, 0.1, 0.1),
        });
        yPosition -= 30;
        
        for (const material of planData.materials) {
          checkPageSpace(45);
          page.drawText(`• ${material.item}`, {
            x: margin + 10,
            y: yPosition,
            size: 11,
            font: timesRomanBoldFont,
          });
          yPosition -= 16;
          page.drawText(`  Quantity: ${material.quantity}`, {
            x: margin + 15,
            y: yPosition,
            size: 10,
            font: timesRomanFont,
            color: rgb(0.3, 0.3, 0.3),
          });
          page.drawText(`Cost: $${material.estimatedCost?.toLocaleString() || '0'}`, {
            x: margin + 250,
            y: yPosition,
            size: 10,
            font: courierFont,
            color: rgb(0, 0.4, 0.2),
          });
          yPosition -= 22;
        }
        yPosition -= 10;
      }
      
      // Execution Steps
      if (planData.executionSteps && planData.executionSteps.length > 0) {
        checkPageSpace(50);
        page.drawText("Execution Steps", {
          x: margin,
          y: yPosition,
          size: 18,
          font: timesRomanBoldFont,
          color: rgb(0.1, 0.1, 0.1),
        });
        yPosition -= 30;
        
        for (let i = 0; i < planData.executionSteps.length; i++) {
          const step = planData.executionSteps[i];
          const stepLines = wrapText(`${i + 1}. ${step}`, contentWidth - 20, 10, timesRomanFont);
          
          for (let j = 0; j < stepLines.length; j++) {
            checkPageSpace(18);
            page.drawText(stepLines[j], {
              x: margin + (j > 0 ? 20 : 10),
              y: yPosition,
              size: 10,
              font: timesRomanFont,
            });
            yPosition -= 14;
          }
          yPosition -= 8;
        }
        yPosition -= 10;
      }
      
      // Disposal Information
      if (planData.disposalInfo) {
        checkPageSpace(50);
        page.drawText("Disposal Information", {
          x: margin,
          y: yPosition,
          size: 18,
          font: timesRomanBoldFont,
          color: rgb(0.1, 0.1, 0.1),
        });
        yPosition -= 30;
        
        if (planData.disposalInfo.regulationsSummary) {
          checkPageSpace(30);
          page.drawText("Regulations Summary:", {
            x: margin,
            y: yPosition,
            size: 12,
            font: timesRomanBoldFont,
          });
          yPosition -= 20;
          
          const regLines = wrapText(planData.disposalInfo.regulationsSummary, contentWidth - 10, 10, timesRomanFont);
          for (const line of regLines) {
            checkPageSpace(16);
            page.drawText(line, {
              x: margin + 10,
              y: yPosition,
              size: 10,
              font: timesRomanFont,
            });
            yPosition -= 14;
          }
          yPosition -= 15;
        }
        
        if (planData.disposalInfo.landfillOptions && planData.disposalInfo.landfillOptions.length > 0) {
          checkPageSpace(30);
          page.drawText("Landfill Options:", {
            x: margin,
            y: yPosition,
            size: 12,
            font: timesRomanBoldFont,
          });
          yPosition -= 20;
          
          for (const option of planData.disposalInfo.landfillOptions) {
            checkPageSpace(40);
            page.drawText(`• ${option.name}`, {
              x: margin + 10,
              y: yPosition,
              size: 11,
              font: timesRomanBoldFont,
            });
            yPosition -= 16;
            page.drawText(option.address, {
              x: margin + 15,
              y: yPosition,
              size: 10,
              font: timesRomanFont,
              color: rgb(0.3, 0.3, 0.3),
            });
            yPosition -= 20;
          }
        }
      }
      
      // Footer on all pages
      const pages = pdfDoc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        p.drawText(`Generated by AI Project Planner - Page ${i + 1} of ${pages.length}`, {
          x: margin,
          y: 30,
          size: 8,
          font: timesRomanFont,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      
      // Send PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${project.projectName.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error exporting project:", error);
      res.status(500).json({ error: "Failed to export project" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper function to wrap text
function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}
