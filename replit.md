# Overview

This is a comprehensive HR Management System built as a full-stack web application for managing employees, departments, evaluations, and organizational hierarchy. The system provides functionality for creating and managing evaluation forms, conducting employee assessments, tracking department structures, and visualizing organizational charts. It features a modern, responsive user interface with comprehensive CRUD operations for all HR-related entities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing without the complexity of React Router
- **UI Framework**: Tailwind CSS for utility-first styling with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack Query (React Query) for server state management, caching, and data fetching with local React state for component-level state
- **Build Tool**: Vite for fast development and optimized production builds with hot module replacement

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API development
- **Language**: TypeScript for type safety across the entire stack
- **Development**: Currently uses in-memory storage with a clean interface pattern that allows easy migration to database persistence
- **API Design**: RESTful architecture with /api prefix for all backend routes

## Data Storage Strategy
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Database**: PostgreSQL configured via Neon Database serverless connection
- **Schema**: Centralized schema definition in shared directory for type consistency between frontend and backend
- **Migrations**: Drizzle Kit for database schema migrations and management

## UI Component System
- **Design System**: shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming and consistent design tokens
- **Layout**: Responsive sidebar navigation with main content area
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Development Architecture
- **Monorepo Structure**: Organized with separate client, server, and shared directories
- **Type Sharing**: Shared TypeScript types and Zod schemas between frontend and backend
- **Development Server**: Vite dev server with Express API proxy for seamless full-stack development
- **Build Process**: Vite for frontend build and esbuild for backend compilation

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection for Neon Database
- **drizzle-orm** and **drizzle-zod**: Type-safe ORM with Zod integration for database operations
- **@tanstack/react-query**: Server state management and caching for efficient data fetching

## UI and Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Utility for creating type-safe component variants
- **lucide-react**: Modern icon library with consistent design

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety across the entire application
- **wouter**: Lightweight routing library for single-page application navigation
- **@replit/vite-plugin-runtime-error-modal**: Development error handling for Replit environment

## Form and Validation
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries
- **zod**: TypeScript-first schema validation for runtime type checking

## Date and Utility Libraries
- **date-fns**: Modern date utility library for date formatting and manipulation
- **nanoid**: Secure URL-friendly unique string ID generator
- **clsx** and **tailwind-merge**: Utility functions for conditional CSS class management