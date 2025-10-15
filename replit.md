# AI Project Planner - Comprehensive Home Improvement Planning

## Overview
A professional-grade AI-powered project planning application built with React, TypeScript, Express.js, and Google Gemini AI. The application generates detailed home improvement plans including materials lists, cost breakdowns, step-by-step execution guides, and local disposal information for Chesterfield County, Virginia.

## Current State
**Status:** MVP Complete and Functional  
**Last Updated:** October 15, 2025

The application is fully functional with a beautiful, responsive UI following modern design principles. All core features are implemented and working:
- ✅ AI-powered project plan generation
- ✅ Comprehensive materials and cost analysis
- ✅ Step-by-step execution guides
- ✅ Disposal regulations and landfill information
- ✅ Dark mode support
- ✅ Responsive design across all devices
- ✅ Error handling with retry capability
- ✅ Beautiful loading and empty states

## Architecture

### Tech Stack
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Shadcn UI
- **Backend:** Express.js, Node.js, TypeScript
- **AI Integration:** Google Gemini AI (gemini-2.5-flash model)
- **State Management:** TanStack Query (React Query v5)
- **Routing:** Wouter
- **Validation:** Zod

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ThemeToggle.tsx          # Dark mode toggle
│   │   │   ├── ProjectInput.tsx         # Project description form
│   │   │   ├── ProjectPlanDisplay.tsx   # Results display
│   │   │   ├── ErrorDisplay.tsx         # Error handling UI
│   │   │   ├── EmptyState.tsx          # Initial empty state
│   │   │   └── ui/                     # Shadcn base components
│   │   ├── pages/         # Page components
│   │   │   ├── Home.tsx               # Main application page
│   │   │   └── not-found.tsx          # 404 page
│   │   ├── lib/           # Utilities
│   │   │   └── queryClient.ts         # TanStack Query setup
│   │   └── App.tsx        # Root application component
│   └── index.html         # HTML entry point
├── server/                # Backend Express application
│   ├── routes.ts          # API routes with Gemini integration
│   ├── storage.ts         # Storage interface (unused)
│   └── index.ts           # Express server setup
├── shared/                # Shared types between frontend and backend
│   └── schema.ts          # TypeScript interfaces and Zod schemas
└── design_guidelines.md   # Design system documentation
```

## Key Features

### 1. AI-Powered Project Planning
- Uses Google Gemini 2.5 Flash model for intelligent plan generation
- Analyzes user project descriptions to create comprehensive plans
- Provides location-specific information for Chesterfield County, Virginia

### 2. Comprehensive Project Plans
Each generated plan includes:
- **Project Name:** Clear, concise title
- **Materials List:** Detailed items with quantities and estimated costs
- **Cost Analysis Dashboard:**
  - Total materials cost
  - Estimated labor cost
  - Total project cost
- **Execution Steps:** Numbered, step-by-step instructions
- **Disposal Information:**
  - Local regulations summary
  - Landfill and disposal facility options with addresses

### 3. Beautiful User Interface
- Modern, clean design with professional aesthetics
- Fully responsive across all device sizes
- Dark mode support with localStorage persistence
- Smooth animations and transitions
- Proper loading, error, and empty states
- Follows strict design guidelines for consistency

### 4. Robust Error Handling
- Graceful handling of API failures
- User-friendly error messages
- Retry functionality for failed requests
- Validation for user input (10-2000 characters)

## API Documentation

### Endpoints

#### `GET /api/health`
Health check endpoint to verify server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T14:00:00.000Z"
}
```

#### `POST /api/plan-project`
Generate a comprehensive project plan using AI.

**Request Body:**
```json
{
  "projectDescription": "string (10-2000 characters)"
}
```

**Success Response (200):**
```json
{
  "projectName": "Kitchen Cabinet Installation",
  "materials": [
    {
      "item": "Kitchen cabinets",
      "quantity": "10 units",
      "estimatedCost": 2500
    }
  ],
  "costAnalysis": {
    "totalMaterialsCost": 3500,
    "estimatedLaborCost": 2000,
    "totalProjectCost": 5500
  },
  "executionSteps": [
    "Step 1: Measure kitchen space...",
    "Step 2: Remove old cabinets..."
  ],
  "disposalInfo": {
    "regulationsSummary": "Construction debris must be...",
    "landfillOptions": [
      {
        "name": "Chesterfield County Landfill",
        "address": "123 Landfill Rd, Chesterfield, VA"
      }
    ]
  }
}
```

**Error Responses:**
- `400`: Invalid input data
- `500`: AI generation failed
- `503`: AI service overloaded

## Environment Variables

### Required
- `GEMINI_API_KEY` - Google Gemini API key (get from https://aistudio.google.com/app/apikey)
- `SESSION_SECRET` - Session secret for Express (auto-generated by Replit)

### Optional
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (default: development)

## Design System

The application follows a comprehensive design system documented in `design_guidelines.md`:

### Colors
- **Primary:** Blue (#3B82F6) - Trust and professionalism
- **Success:** Green (#22C55E) - Cost indicators, completion
- **Warning:** Orange (#F59E0B) - Alerts and cautions
- **Background:** Near-white in light mode, deep slate in dark mode

### Typography
- **Primary Font:** Inter (Google Fonts)
- **Monospace Font:** JetBrains Mono (for cost figures)
- **Type Scale:** Responsive sizing from mobile to desktop

### Components
- Uses Shadcn UI component library
- Custom styling with TailwindCSS
- Consistent spacing: 4, 6, 8, 12, 16, 24 units
- Rounded corners: 6-9px (md)

## User Experience

### User Journey
1. **Landing:** User sees clean interface with description form
2. **Input:** User types project description or selects example
3. **Generation:** User clicks "Generate Project Plan" button
4. **Loading:** Beautiful loading state with spinner animation
5. **Results:** Comprehensive plan displays with smooth animations
6. **Interaction:** User can retry, toggle dark mode, or start new plan

### Example Projects Provided
- "Install new kitchen cabinets in a 10x12 foot kitchen"
- "Build a backyard deck (12x16 feet) with composite materials"
- "Replace asphalt shingle roof on a 1,500 sq ft ranch home"
- "Install hardwood flooring in living room and hallway (400 sq ft)"

## Known Considerations

### AI Response Times
- Typical generation time: 5-15 seconds
- May take up to 60-90 seconds during peak usage
- Gemini API may occasionally return 503 (overloaded) errors
- The application handles these gracefully with retry options

### Data Persistence
- Current version does not persist project plans
- Plans are stored only in component state during session
- Future enhancement: Add database to save project history

## Testing

The application has been tested for:
- ✅ Form validation and user input handling
- ✅ Dark mode toggle functionality
- ✅ Responsive design across breakpoints
- ✅ Error handling and retry functionality
- ✅ Loading states and animations
- ✅ API integration with proper error handling

### Test Data IDs
All interactive elements have `data-testid` attributes for e2e testing:
- `button-theme-toggle` - Theme toggle button
- `input-project-description` - Main textarea
- `button-example-{index}` - Example project chips
- `button-generate-plan` - Submit button
- `text-project-name` - Generated project name
- `card-cost-materials`, `card-cost-labor`, `card-cost-total` - Cost cards
- `text-error-message` - Error message text
- `button-retry` - Retry button

## Development

### Running Locally
The application runs on a single port (5000) with Vite serving the frontend and Express handling the backend:

```bash
npm run dev
```

Access at: `http://localhost:5000`

### Code Quality
- TypeScript strict mode enabled
- Zod validation for all data
- Proper error boundaries
- LSP diagnostics: ✅ All clear

## Future Enhancements

### Potential Features
1. **Database Integration:** Save and retrieve project history
2. **User Authentication:** Personal project libraries
3. **PDF Export:** Download plans as PDF documents
4. **Location Customization:** Support for multiple counties/states
5. **Cost Estimation:** Real-time pricing from suppliers
6. **Project Comparison:** Compare multiple approaches
7. **Image Upload:** Visual context for better AI analysis
8. **Sharing:** Share plans via unique URLs

### Technical Improvements
1. Implement caching for similar project descriptions
2. Add request queuing for Gemini API rate limits
3. Optimize bundle size with code splitting
4. Add service worker for offline functionality
5. Implement analytics for popular project types

## Deployment

The application is ready for deployment. It follows Replit's best practices:
- Single-port architecture (frontend and backend on port 5000)
- Environment variables properly configured
- No hardcoded secrets
- Production-ready error handling

To deploy:
1. Ensure GEMINI_API_KEY is set in Secrets
2. Click "Publish" in Replit
3. Application will be available at `https://[your-repl].replit.app`

## Credits

- **AI Model:** Google Gemini 2.5 Flash
- **UI Components:** Shadcn UI
- **Icons:** Lucide React
- **Design Inspiration:** Linear, Notion, modern AI interfaces

---

**Built with ❤️ using Replit Agent**
