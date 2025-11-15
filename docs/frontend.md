# Frontend Documentation

## Overview

The AgroTerror frontend is a Next.js 16 application built with React 19, providing an interactive web interface for AI-powered gene editing analysis. It features 3D DNA visualizations, user authentication, gene analysis workflows, and an integrated chatbot for educational queries.

## Architecture

```
┌─────────────────────────────────────┐
│      Next.js App Router             │
│         (App Router)                │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐          ┌─────▼─────┐
│ Pages  │          │ Components│
│ (App)  │          │  (UI)     │
└───┬────┘          └─────┬─────┘
    │                     │
    │              ┌──────▼──────┐
    │              │ 3D Animations│
    │              │ (Three.js)   │
    │              └──────┬───────┘
    │                     │
┌───▼─────────────────────▼─────┐
│      API Integration           │
│   (lib/api.ts)                 │
└──────────────┬─────────────────┘
               │
       ┌───────▼────────┐
       │  FastAPI Server│
       │  (localhost:8000)│
       └─────────────────┘
```

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── login/               # Authentication pages
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── dashboard/           # User dashboard
│   │   ├── page.tsx
│   │   └── chatbot/
│   │       └── page.tsx
│   ├── home/                # Home section pages
│   │   ├── page.tsx
│   │   ├── documentation/
│   │   ├── resources/
│   │   ├── simulation/
│   │   └── how-it-works/
│   │       ├── edit-design/
│   │       ├── guide-design/
│   │       ├── optimization/
│   │       ├── trait-mining/
│   │       └── validation/
│   └── analysis/            # Gene analysis page
│       └── page.tsx
├── components/              # React components
│   ├── animations/          # 3D DNA animations
│   │   ├── DNAModel3D.tsx
│   │   ├── DNAModel3DWrapper.tsx
│   │   ├── DNAHelixAnimation.tsx
│   │   ├── DNAHelix3DWrapper.tsx
│   │   ├── RealTimeDNAEditing.tsx
│   │   └── RealTimeDNAEditingWrapper.tsx
│   ├── chatbot/            # Chatbot widget
│   │   └── ChatbotWidget.tsx
│   ├── home/               # Home page components
│   │   ├── HeroSection.tsx
│   │   ├── NavigationHeader.tsx
│   │   ├── NavigationHub.tsx
│   │   ├── ProjectOverview.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── QuickStartGuide.tsx
│   │   ├── GettingStartedChecklist.tsx
│   │   ├── FAQPreview.tsx
│   │   ├── SimulationDemo.tsx
│   │   └── OnboardingHeader.tsx
│   └── ui/                 # UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── FeatureCard.tsx
│       └── StepCard.tsx
├── lib/                    # Utility libraries
│   ├── api.ts             # API client functions
│   ├── markdown-to-text.ts
│   ├── react-compat.ts
│   └── three/             # Three.js utilities
│       ├── materials.ts
│       ├── utils.ts
│       └── models/
│           └── dna-helix.ts
├── public/                # Static assets
│   ├── logo.png
│   └── uploads_files_3251711_ДНК5.glb
├── types/                 # TypeScript type definitions
│   └── react-three-fiber.d.ts
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.js
```

## Key Features

### 1. User Authentication

- **Registration**: User account creation with email and username
- **Login**: JWT-based authentication
- **Token Management**: Secure token storage in localStorage
- **Protected Routes**: Authentication-required pages

**Components:**
- `app/login/page.tsx` - Login page
- `app/register/page.tsx` - Registration page
- `lib/api.ts` - Auth API functions

### 2. Gene Analysis Interface

- **DNA Sequence Input**: Text input for DNA sequences
- **Trait Selection**: Target trait selection (plant_height, yield, disease_resistance, etc.)
- **Analysis Execution**: Submit analysis requests to backend
- **Results Display**: Visualize edit suggestions, validations, and SNP changes
- **History View**: View past analysis results

**Components:**
- `app/analysis/page.tsx` - Analysis interface
- `app/dashboard/page.tsx` - Dashboard with analysis history

### 3. 3D DNA Visualizations

- **DNA Helix Models**: Interactive 3D DNA double helix
- **Real-time Editing**: Visualize gene edits in real-time
- **Three.js Integration**: Powered by React Three Fiber

**Components:**
- `components/animations/DNAModel3D.tsx` - 3D DNA model
- `components/animations/DNAHelixAnimation.tsx` - Animated helix
- `components/animations/RealTimeDNAEditing.tsx` - Editing visualization

### 4. Chatbot Widget

- **LLM Integration**: Google Gemini-powered chatbot
- **Multi-language Support**: English, Hindi, Kannada
- **Difficulty Levels**: Basic, Intermediate, Advanced
- **Educational Queries**: Answer questions about CRISPR and gene editing

**Components:**
- `components/chatbot/ChatbotWidget.tsx` - Chatbot interface
- `app/dashboard/chatbot/page.tsx` - Chatbot page

### 5. Documentation and Resources

- **How It Works**: Step-by-step guides
- **Documentation**: Technical documentation
- **Resources**: Educational resources
- **Simulation**: Interactive simulations

**Pages:**
- `app/home/how-it-works/` - How it works guides
- `app/home/documentation/` - Documentation
- `app/home/resources/` - Resources
- `app/home/simulation/` - Simulations

## Setup and Installation

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm, yarn, pnpm, or bun
- FastAPI server running on `http://localhost:8000`

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Technology Stack

### Core Technologies

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS 4**: Utility-first CSS framework

### 3D Graphics

- **Three.js**: 3D graphics library
- **React Three Fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for R3F

### UI Components

- **Lucide React**: Icon library
- **Custom Components**: Reusable UI components

## API Integration

### API Client (`lib/api.ts`)

The frontend uses a centralized API client for all backend communication:

#### Authentication API

```typescript
// Register user
register(request: RegisterRequest): Promise<UserResponse>

// Login
login(request: LoginRequest): Promise<TokenResponse>

// Get current user
getCurrentUser(): Promise<UserResponse>

// Token management
setAuthToken(token: string)
getAuthToken(): string | null
removeAuthToken()
```

#### LLM Query API

```typescript
// Query LLM
queryLLM(request: LLMQueryRequest): Promise<LLMQueryResponse>
```

#### Gene Analysis API

```typescript
// Analyze gene edits
analyzeGeneEdits(request: GeneAnalysisRequest): Promise<GeneAnalysisResponse>

// Get analysis history
getAnalysisHistory(limit: number, skip: number): Promise<AnalysisHistoryResponse>

// Get analysis detail
getAnalysisDetail(analysisId: string): Promise<GeneAnalysisResponse>
```

### API Configuration

The API base URL is configured via environment variable:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### Authentication Flow

1. User logs in via `login()` function
2. Token is stored in localStorage
3. Token is automatically included in API requests via `Authorization` header
4. Protected routes check for token presence

## Pages and Routes

### Public Routes

- `/` - Landing page
- `/home` - Home page
- `/home/documentation` - Documentation
- `/home/resources` - Resources
- `/home/simulation` - Simulation
- `/home/how-it-works/*` - How it works guides
- `/login` - Login page
- `/register` - Registration page

### Protected Routes

- `/dashboard` - User dashboard
- `/dashboard/chatbot` - Chatbot interface
- `/analysis` - Gene analysis interface

### Route Structure

```
/                           # Landing page
├── /login                 # Login
├── /register              # Registration
├── /home                  # Home section
│   ├── /documentation     # Documentation
│   ├── /resources         # Resources
│   ├── /simulation        # Simulation
│   └── /how-it-works      # How it works
│       ├── /edit-design   # Edit design
│       ├── /guide-design  # Guide design
│       ├── /optimization  # Optimization
│       ├── /trait-mining  # Trait mining
│       └── /validation    # Validation
├── /dashboard             # Dashboard (protected)
│   └── /chatbot           # Chatbot (protected)
└── /analysis              # Analysis (protected)
```

## Components

### Animation Components

#### DNAModel3D

3D DNA double helix model using Three.js:
- Interactive rotation and zoom
- Customizable materials and colors
- GLB model loading

#### DNAHelixAnimation

Animated DNA helix visualization:
- Smooth animations
- Configurable parameters
- Responsive design

#### RealTimeDNAEditing

Real-time gene editing visualization:
- Edit suggestion display
- Mutation highlighting
- Interactive controls

### UI Components

#### Button

Reusable button component with variants:
- Primary, secondary, outline variants
- Loading states
- Icon support

#### Card

Card component for content containers:
- Header and footer support
- Variants and styles
- Responsive design

#### FeatureCard

Feature display card:
- Icon support
- Title and description
- Hover effects

### Home Components

#### HeroSection

Landing page hero section:
- Call-to-action buttons
- Feature highlights
- Responsive design

#### NavigationHeader

Main navigation header:
- Logo and branding
- Navigation links
- User authentication status

#### ProjectOverview

Project overview section:
- Feature highlights
- Benefits list
- Visual elements

#### HowItWorks

How it works section:
- Step-by-step guide
- Interactive elements
- Visual explanations

## Styling

### Tailwind CSS

The frontend uses Tailwind CSS 4 for styling:
- Utility-first approach
- Responsive design
- Custom theme configuration

### Global Styles

Global styles are defined in `app/globals.css`:
- CSS variables
- Base styles
- Font configurations

### Fonts

The application uses Geist fonts:
- **Geist Sans**: Primary font
- **Geist Mono**: Monospace font

## State Management

### Local State

Components use React hooks for local state:
- `useState` for component state
- `useEffect` for side effects
- `useRouter` for navigation

### Authentication State

Authentication state is managed via:
- localStorage for token storage
- API client for token management
- Route protection based on token presence

## Environment Variables

### Required Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Optional Variables

```env
# API timeout (default: 30000ms)
NEXT_PUBLIC_API_TIMEOUT=30000
```

## Development

### Running in Development Mode

```bash
npm run dev
```

The development server runs on `http://localhost:3000` with hot reload.

### Linting

```bash
npm run lint
```

### Type Checking

TypeScript type checking is performed during build:
```bash
npm run build
```

## Deployment

### Vercel Deployment

The easiest way to deploy is using Vercel:

1. **Connect repository to Vercel**
2. **Configure environment variables**
3. **Deploy**

### Docker Deployment

Create a Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Environment Configuration

Set environment variables in your deployment platform:
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Integration with Backend

### API Endpoints

The frontend communicates with the FastAPI server:

- **Authentication**: `/auth/*`
- **LLM Queries**: `/llm/query`
- **Gene Analysis**: `/gene-analysis/*`

### Error Handling

API errors are handled consistently:
- Network errors
- Authentication errors
- Validation errors
- Server errors

### Rate Limiting

The frontend handles rate limiting:
- Retry logic
- User feedback
- Error messages

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check if backend server is running
   - Verify CORS configuration

2. **Authentication Issues**
   - Check token storage in localStorage
   - Verify token expiration
   - Check API response format

3. **3D Rendering Issues**
   - Check browser WebGL support
   - Verify Three.js dependencies
   - Check console for errors

4. **Build Errors**
   - Clear `.next` directory
   - Reinstall dependencies
   - Check TypeScript errors

## Future Enhancements

Potential improvements:
- Real-time updates via WebSockets
- Offline support with service workers
- Advanced visualization options
- Export functionality for analysis results
- Mobile app support
- Enhanced error handling
- Performance optimizations
- Accessibility improvements

## Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev
- **Three.js Documentation**: https://threejs.org/docs
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **Tailwind CSS**: https://tailwindcss.com/docs

