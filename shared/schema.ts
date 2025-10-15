import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";

// =======================
// Auth Tables (Required for Replit Auth)
// =======================

// Session storage table (MANDATORY for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (MANDATORY for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// =======================
// Project Plans Table
// =======================

export const projectPlans = pgTable("project_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectName: text("project_name").notNull(),
  projectDescription: text("project_description").notNull(),
  planData: jsonb("plan_data").notNull(), // Stores the full ProjectPlan object
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_project_plans_user_id").on(table.userId),
  index("idx_project_plans_created_at").on(table.createdAt),
]);

export type ProjectPlanRecord = typeof projectPlans.$inferSelect;
export type InsertProjectPlanRecord = typeof projectPlans.$inferInsert;

// =======================
// Project Plan Interface (AI Response)
// =======================

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

// =======================
// Zod Schemas for Validation
// =======================

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

export const projectInputSchema = z.object({
  projectDescription: z.string().min(10, "Please provide a more detailed project description").max(2000, "Project description is too long"),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
