# AI Project Planner - Replit Agent Guide

## Overview

This application is an AI-powered home improvement project planner that generates comprehensive project plans using Google's Gemini AI. Users input a project description and receive detailed materials lists, cost breakdowns, step-by-step execution guides, and disposal information specific to Chesterfield County, Virginia.

The application serves as a planning assistant for homeowners, providing realistic cost estimates, material quantities, and local regulatory information for construction debris disposal.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite for fast development and optimized production builds
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state management
- **UI Components:** Radix UI primitives with custom shadcn/ui styling
- **Styling:** Tailwind CSS with custom design system

**Design System:**
- Custom color palette supporting light/dark modes
- Typography using Inter (primary) and JetBrains Mono (monospace for technical data)
- Component library follows "New York" shadcn/ui style variant
- Design inspired by Linear, Notion, and modern AI interfaces
- Focus on clarity, progressive disclosure, and professional aesthetics

**Key Frontend Components:**
- `ProjectInput`: Form for capturing project descriptions with validation
- `ProjectPlanDisplay`: Renders AI-generated plans with organized sections
- `ErrorDisplay`: User-friendly error handling with retry functionality
- `ThemeToggle`: Dark/light mode switcher with localStorage persistence

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript with ES modules
- **AI Integration:** Google Gemini AI (using @google/genai SDK)
- **Build Tool:** esbuild for production bundling

**API Design:**
- RESTful endpoint structure
- `/api/health` - Health check endpoint
- `/api/plan-project` - Main AI planning endpoint (POST)
- Input validation using Zod schemas
- Structured JSON responses matching predefined schemas

**AI Prompt Engineering:**
- "Plan-and-Solve" approach for comprehensive analysis
- Location-specific responses (Chesterfield County, Virginia)
- Structured JSON output enforced through prompt design
- Includes materials, costs, execution steps, and disposal regulations

### Data Storage Solutions

**Current Implementation:**
- In-memory storage using `MemStorage` class
- User management interface defined but not fully utilized
- Storage abstraction allows easy migration to persistent database

**Database Schema (Defined but not actively used):**
- User schema with id, username fields
- Drizzle ORM configured for PostgreSQL (via @neondatabase/serverless)
- Schema defined in `shared/schema.ts`
- Migration configuration present in `drizzle.config.ts`

**Future Considerations:**
- Project history persistence
- User authentication and saved plans
- Cost tracking and comparison features

### External Dependencies

**AI Services:**
- **Google Gemini AI:** Core AI service for project plan generation
  - API Key required via `GEMINI_API_KEY` environment variable
  - Models supported: gemini-2.5-flash, gemini-2.5-pro
  - Handles complex planning with structured output

**Database (Configured but Optional):**
- **Neon PostgreSQL:** Serverless PostgreSQL database
  - Connection via `DATABASE_URL` environment variable
  - Drizzle ORM for type-safe database queries
  - Currently not required for basic functionality

**UI Component Library:**
- **Radix UI:** Headless accessible component primitives
  - 30+ components imported (accordion, dialog, dropdown, etc.)
  - Provides accessibility and keyboard navigation
  - Customized with Tailwind CSS

**Development Tools:**
- **Replit Integration:** Development environment optimizations
  - Cartographer plugin for code navigation
  - Runtime error modal overlay
  - Dev banner for development mode

**Build and Development:**
- **Vite:** Frontend build tool and dev server
- **esbuild:** Backend bundling for production
- **TypeScript:** Type safety across full stack
- **Tailwind CSS:** Utility-first styling with PostCSS

**Validation and Forms:**
- **Zod:** Schema validation for API inputs/outputs
- **React Hook Form:** Form state management (@hookform/resolvers for Zod integration)

**Key Environment Variables Required:**
- `GEMINI_API_KEY` - Google Gemini AI authentication (required)
- `DATABASE_URL` - PostgreSQL connection string (optional, for future persistence)
- `NODE_ENV` - Environment mode (development/production)