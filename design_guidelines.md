# Design Guidelines: Gemini Project Planner

## Design Approach

**Selected Approach:** Design System with Modern Productivity Tool Aesthetics

Drawing inspiration from Linear's precision, Notion's content organization, and modern AI interfaces (ChatGPT/Claude) to create a clean, professional planning tool that presents complex information clearly while maintaining visual appeal.

## Core Design Principles

1. **Clarity First:** Information hierarchy that guides users from input to actionable insights
2. **Trust Through Design:** Professional aesthetics that inspire confidence in AI-generated plans
3. **Progressive Disclosure:** Reveal complexity gradually without overwhelming users
4. **Data-Focused Beauty:** Make numbers, lists, and technical details visually digestible

---

## Color Palette

### Light Mode
- **Background:** 240 20% 99% (near-white with subtle warmth)
- **Surface:** 0 0% 100% (pure white for cards/panels)
- **Primary:** 217 91% 60% (confident blue - trust and professionalism)
- **Primary Hover:** 217 91% 50%
- **Text Primary:** 222 47% 11% (deep slate)
- **Text Secondary:** 215 16% 47% (muted slate)
- **Border:** 214 32% 91% (soft borders)
- **Success:** 142 71% 45% (for cost indicators, completion states)
- **Warning:** 38 92% 50% (for cost alerts)

### Dark Mode
- **Background:** 222 47% 11% (deep slate)
- **Surface:** 217 33% 17% (elevated dark surface)
- **Primary:** 217 91% 60% (same blue, works in both modes)
- **Primary Hover:** 217 91% 70%
- **Text Primary:** 210 20% 98%
- **Text Secondary:** 215 20% 65%
- **Border:** 217 33% 25%
- **Success:** 142 71% 45%
- **Warning:** 38 92% 50%

---

## Typography

**Font Families:**
- **Primary:** 'Inter', system-ui, sans-serif (via Google Fonts CDN)
- **Monospace:** 'JetBrains Mono', monospace (for cost figures, technical data)

**Type Scale:**
- **Hero/H1:** text-4xl md:text-5xl, font-bold, tracking-tight
- **Section Headers/H2:** text-2xl md:text-3xl, font-semibold
- **Subsection/H3:** text-xl font-semibold
- **Body:** text-base leading-relaxed
- **Small/Meta:** text-sm text-secondary
- **Data/Numbers:** font-mono text-lg font-semibold

---

## Layout System

**Spacing Primitives:** Consistently use Tailwind units of 4, 6, 8, 12, 16, 24 (p-4, gap-6, mb-8, py-12, etc.)

**Container Strategy:**
- Max-width: max-w-6xl for main content area
- Padding: px-4 sm:px-6 lg:px-8 for responsive edge spacing
- Vertical rhythm: space-y-8 between major sections, space-y-4 within sections

**Grid Usage:**
- Materials list: 2-column grid on md+ (grid-cols-1 md:grid-cols-2)
- Cost breakdown: 3-column grid for cost metrics (grid-cols-1 sm:grid-cols-3)
- Disposal options: 2-column cards (grid-cols-1 lg:grid-cols-2)

---

## Component Library

### Input Section
- **Form Container:** Full-width card with shadow-lg, rounded-xl, bg-surface
- **Textarea:** min-h-32, rounded-lg border-2, focus:border-primary transition, placeholder with helpful examples
- **Submit Button:** Large (py-3 px-8), primary color, rounded-lg, with loading state (spinner icon from Heroicons)
- **Character Counter:** Bottom-right corner, text-sm text-secondary

### Results Display Architecture

**1. Project Header Card**
- Prominent project name with icon (Heroicons: BeakerIcon or WrenchIcon)
- Subtle gradient background (from-primary/5 to-transparent)
- Rounded-2xl with border

**2. Materials Section**
- Grid layout (2 columns on desktop)
- Each material as a card with: item name (font-semibold), quantity badge (rounded-full bg-primary/10), cost in mono font
- Hover effect: subtle scale and shadow increase
- Running total in sticky footer

**3. Cost Analysis Dashboard**
- Three-column stat cards with:
  - Large number (text-3xl font-mono)
  - Label below (text-sm uppercase tracking-wide)
  - Icon from Heroicons (CurrencyDollarIcon, UserGroupIcon, CalculatorIcon)
- Color-coded borders: materials (blue), labor (purple), total (green)

**4. Execution Steps Timeline**
- Vertical timeline with connecting lines
- Each step in numbered badge (rounded-full)
- Step description in card with left border accent
- Checkmark placeholders for future interactivity

**5. Disposal Information Panel**
- Two-part layout: Regulations summary (left) + Landfill options cards (right)
- Regulations: bg-warning/5 with alert icon
- Landfill cards: Map pin icon, name, address, with directional arrow CTAs

### Navigation & Header
- Fixed top bar with blur background (backdrop-blur-lg bg-surface/80)
- Logo/title left, theme toggle right (sun/moon icons from Heroicons)
- Subtle bottom border for depth

### Loading & Empty States
- **Loading:** Centered spinner with pulsing animation, "Analyzing your project..." text
- **Empty State:** Illustration placeholder (comment: <!-- CUSTOM ILLUSTRATION: Construction planning -->), inviting copy, example projects as chips

---

## Interaction Patterns

**Micro-interactions:**
- Button hover: scale-105 transition-transform
- Card hover: shadow-xl transition-shadow
- Form focus: ring-2 ring-primary/50
- Success state: slide-in animation from right (after AI response)

**Responsive Behavior:**
- Mobile: Stack all columns, full-width cards, hamburger if navigation expands
- Tablet: 2-column grids where applicable
- Desktop: Full multi-column layouts, side-by-side comparisons

---

## Icons & Assets

**Icon Library:** Heroicons (via CDN) - use outline variant for most UI, solid for emphasis

**Key Icons:**
- Input: PencilSquareIcon
- Materials: CubeIcon, ShoppingBagIcon
- Costs: CurrencyDollarIcon, ChartBarIcon
- Steps: ClipboardDocumentCheckIcon
- Disposal: TrashIcon, MapPinIcon
- Loading: ArrowPathIcon (animated)

**Imagery:** No large hero images needed - this is a utility tool. Focus on crisp icons, subtle gradients, and data visualization.

---

## Accessibility & Dark Mode

- Maintain WCAG AA contrast ratios in both modes
- All interactive elements have focus indicators (ring-2 ring-primary)
- Form inputs with proper labels and aria-descriptions
- Dark mode toggle persists via localStorage
- Smooth theme transition with transition-colors duration-200

---

## Special Considerations

**AI Response Presentation:**
- Stagger-reveal animation for each section (delay-100, delay-200, etc.)
- Clear visual separation between input and output
- "Copy to clipboard" button for shareable plan
- Export options (PDF/Print) for future phases

**Error States:**
- Error card with red accent border
- Retry button prominently displayed
- Helpful error messages in plain language
- Fallback for API timeouts

**Trust Signals:**
- "Powered by Google Gemini" badge
- Timestamp of generation
- Disclaimer about estimates (small print, non-intrusive)
- Location badge showing "Analysis for Chesterfield County, VA"

This design system creates a professional, data-rich planning tool that balances utility with modern aesthetics, ensuring users trust the AI-generated insights while enjoying a polished experience.