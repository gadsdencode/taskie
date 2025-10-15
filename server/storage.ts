import {
  users,
  projectPlans,
  type User,
  type UpsertUser,
  type ProjectPlanRecord,
  type InsertProjectPlanRecord,
  type ProjectPlan,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  createProjectPlan(userId: string, description: string, planData: ProjectPlan): Promise<ProjectPlanRecord>;
  getUserProjectPlans(userId: string): Promise<ProjectPlanRecord[]>;
  getProjectPlan(id: string, userId: string): Promise<ProjectPlanRecord | undefined>;
  deleteProjectPlan(id: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async createProjectPlan(
    userId: string,
    description: string,
    planData: ProjectPlan
  ): Promise<ProjectPlanRecord> {
    const [project] = await db
      .insert(projectPlans)
      .values({
        userId,
        projectName: planData.projectName,
        projectDescription: description,
        planData: planData as any,
      })
      .returning();
    
    // Log the returned project for debugging
    console.log('[createProjectPlan] Returned project:', JSON.stringify({
      id: project?.id,
      projectName: project?.projectName,
      hasId: !!project?.id
    }));
    
    // Fallback: if returning() didn't work, query the most recent project
    if (!project || !project.id) {
      console.warn('[createProjectPlan] No ID returned, querying for most recent project');
      const [latestProject] = await db
        .select()
        .from(projectPlans)
        .where(eq(projectPlans.userId, userId))
        .orderBy(desc(projectPlans.createdAt))
        .limit(1);
      return latestProject;
    }
    
    return project;
  }

  async getUserProjectPlans(userId: string): Promise<ProjectPlanRecord[]> {
    return db
      .select()
      .from(projectPlans)
      .where(eq(projectPlans.userId, userId))
      .orderBy(desc(projectPlans.createdAt));
  }

  async getProjectPlan(id: string, userId: string): Promise<ProjectPlanRecord | undefined> {
    const [project] = await db
      .select()
      .from(projectPlans)
      .where(eq(projectPlans.id, id));
    
    // Verify ownership
    if (project && project.userId !== userId) {
      return undefined;
    }
    
    return project;
  }

  async deleteProjectPlan(id: string, userId: string): Promise<boolean> {
    // First verify ownership
    const project = await this.getProjectPlan(id, userId);
    if (!project) {
      return false;
    }

    await db.delete(projectPlans).where(eq(projectPlans.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
