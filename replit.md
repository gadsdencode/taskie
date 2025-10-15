# AI Project Planner - Comprehensive Home Improvement Planning

## Overview
The AI Project Planner is a professional-grade AI-powered application designed to generate detailed home improvement plans. It provides users with comprehensive outputs including materials lists, cost breakdowns, step-by-step execution guides, and local disposal information for Chesterfield County, Virginia. The application aims to streamline home improvement project planning, offering a robust tool for both individuals and professionals.

## User Preferences
I prefer iterative development with clear communication on significant changes. Please ask before making major architectural decisions or large-scale code refactors. I appreciate detailed explanations of complex technical choices. Do not make changes to the `design_guidelines.md` file. I prefer concise summaries for daily updates but comprehensive reports for milestones.

## System Architecture

### UI/UX Decisions
The application features a modern, clean, and professional design, fully responsive across all device sizes. It supports a dark mode with localStorage persistence and incorporates smooth animations and transitions. The UI follows strict design guidelines, utilizing Shadcn UI components with custom TailwindCSS styling. Typography uses Inter as the primary font and JetBrains Mono for cost figures, with a responsive type scale.

### Technical Implementations
The project is a full-stack application built with React 18, TypeScript, and Vite for the frontend, and Express.js with Node.js and TypeScript for the backend. PostgreSQL (Neon) with Drizzle ORM handles database persistence, and Replit Auth (OpenID Connect) integrated with Passport.js manages user authentication and session management. Google Gemini AI (gemini-2.5-flash) is central to project plan generation. State management is handled by TanStack Query (React Query v5), routing by Wouter, and input validation by Zod.

### Feature Specifications
- **User Authentication & Account Management:** Seamless login via Replit Auth, secure PostgreSQL-backed sessions, user profile syncing, protected routes, and graceful logout.
- **AI-Powered Project Planning:** Utilizes Google Gemini 2.5 Flash to analyze user descriptions and generate comprehensive, location-specific plans, with automatic persistence of generated plans.
- **Project History Management:** Users can view, manage, and delete saved projects through dedicated list and detail views.
- **Comprehensive Project Plans:** Each plan includes a project name, detailed materials list with estimated costs, a cost analysis dashboard (materials, labor, total), step-by-step execution instructions, and local disposal information.
- **Robust Error Handling:** Includes graceful handling of API failures, user-friendly error messages, retry functionality, and input validation.

### System Design Choices
The application adopts a single-port architecture for simplified deployment on Replit. Shared TypeScript interfaces and Zod schemas are used for consistency between the frontend and backend. The project structure is organized into `client/`, `server/`, and `shared/` directories.

## External Dependencies

- **AI Integration:** Google Gemini AI (gemini-2.5-flash model)
- **Database:** PostgreSQL (Neon)
- **Authentication:** Replit Auth (OpenID Connect)