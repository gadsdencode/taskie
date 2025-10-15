import { z } from "zod";

// ProjectPlan schema matching the Gemini AI response structure
export interface Material {
  item: string;
  quantity: string;
  estimatedCost: number;
}

export interface CostAnalysis {
  totalMaterialsCost: number;
  estimatedLaborCost: number;
  totalProjectCost: number;
}

export interface LandfillOption {
  name: string;
  address: string;
}

export interface DisposalInfo {
  regulationsSummary: string;
  landfillOptions: LandfillOption[];
}

export interface ProjectPlan {
  projectName: string;
  materials: Material[];
  costAnalysis: CostAnalysis;
  executionSteps: string[];
  disposalInfo: DisposalInfo;
}

// Zod schemas for validation
export const materialSchema = z.object({
  item: z.string(),
  quantity: z.string(),
  estimatedCost: z.number(),
});

export const costAnalysisSchema = z.object({
  totalMaterialsCost: z.number(),
  estimatedLaborCost: z.number(),
  totalProjectCost: z.number(),
});

export const landfillOptionSchema = z.object({
  name: z.string(),
  address: z.string(),
});

export const disposalInfoSchema = z.object({
  regulationsSummary: z.string(),
  landfillOptions: z.array(landfillOptionSchema),
});

export const projectPlanSchema = z.object({
  projectName: z.string(),
  materials: z.array(materialSchema),
  costAnalysis: costAnalysisSchema,
  executionSteps: z.array(z.string()),
  disposalInfo: disposalInfoSchema,
});

// Input schema for project description
export const projectInputSchema = z.object({
  projectDescription: z.string().min(10, "Please provide a more detailed project description").max(2000, "Project description is too long"),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
