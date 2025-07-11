# HobbyConnect - AI-Powered Hobby Community Platform

## Overview

HobbyConnect is a full-stack web application that helps users discover new hobbies through AI-powered recommendations and connect with like-minded individuals through hobby-focused communities. The platform features personalized hobby suggestions using Google's Gemini AI, real-time chat functionality, and a comprehensive community management system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit's OpenID Connect (OIDC) authentication system
- **Real-time Communication**: WebSocket Server for chat functionality
- **AI Integration**: Google Gemini AI for hobby recommendations

### Key Components

1. **Authentication System**
   - Uses Replit's OIDC for secure user authentication
   - Session management with PostgreSQL session store
   - Passport.js integration for authentication middleware

2. **Database Layer**
   - Drizzle ORM with PostgreSQL database
   - Database migrations managed through Drizzle Kit
   - Structured schema with proper relationships between users, communities, and messages

3. **AI Recommendation Engine**
   - Google Gemini AI integration for personalized hobby suggestions
   - User profile analysis including MBTI personality types, budget constraints, and preferences
   - Blacklisted hobbies filtering

4. **Community Management**
   - Community creation and membership management
   - Category-based organization (art, music, sports, culture, cooking, tech)
   - Location-based features for local meetups

5. **Real-time Chat System**
   - WebSocket-based real-time messaging
   - Community-specific chat rooms
   - Message persistence with PostgreSQL

## Data Flow

1. **User Authentication**: Users authenticate via Replit's OIDC system
2. **Profile Setup**: Users complete detailed profiles including demographics, MBTI, budget, and hobby preferences
3. **AI Recommendations**: Gemini AI analyzes user profiles to generate personalized hobby suggestions
4. **Community Discovery**: Users browse and join communities based on interests and location
5. **Real-time Interaction**: Users engage in real-time chat within community spaces
6. **Data Persistence**: All interactions, preferences, and community data are stored in PostgreSQL

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@google/genai**: Google Gemini AI integration
- **drizzle-orm**: Database ORM and query builder
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect implementation

### UI Dependencies
- **@radix-ui/***: Comprehensive UI component primitives
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form handling with validation

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production build bundling

## Deployment Strategy

### Development Environment
- **Hot Module Replacement**: Vite provides fast development with HMR
- **TypeScript Compilation**: Real-time type checking and compilation
- **Database Migrations**: Automated schema updates with Drizzle Kit

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles Node.js application for production
- **Database**: PostgreSQL with connection pooling via Neon
- **Environment Variables**: Secure configuration management for API keys and database credentials

### Architectural Decisions

1. **Monorepo Structure**: Shared TypeScript types and utilities between client and server
2. **Type Safety**: Full TypeScript implementation with strict type checking
3. **Component Architecture**: Modular component design with shadcn/ui for consistency
4. **Real-time Features**: WebSocket implementation for instant messaging
5. **AI Integration**: External AI service for sophisticated hobby recommendations
6. **Authentication**: Leveraging Replit's built-in authentication system for security
7. **Database Design**: Relational structure with proper foreign key relationships and indexing

The application follows modern web development practices with emphasis on type safety, performance, and user experience. The architecture supports both individual hobby discovery and community-based social interaction.