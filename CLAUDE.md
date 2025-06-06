# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run lint` - Run ESLint checks
- `npm start` - Start production server

## Project Architecture

### Technical Stack
- **Framework**: Next.js 15+ with App Router
- **Database/Auth**: Supabase (PostgreSQL + authentication)
- **UI**: Tailwind CSS + shadcn/ui components with Radix UI primitives
- **Language**: TypeScript
- **State Management**: React hooks (built-in state management)

### Project Structure
This is a Japanese corporate internal portal with user management and announcements functionality:

- `app/` - Next.js App Router pages and API routes
  - `admin/` - Admin-only pages (user management, announcement management)
  - `dashboard/` - Main dashboard and user-facing pages
  - `auth/` - Authentication pages (login, signup, password reset)
  - `api/` - API routes for server-side operations
- `components/` - Reusable UI components
  - `auth/` - Authentication-related components
  - `ui/` - shadcn/ui base components
- `lib/` - Utilities and shared logic
  - `supabase/` - Supabase client configurations (client, server, admin, middleware)
  - `types.ts` - TypeScript type definitions
  - `utils.ts` - Utility functions

### Authentication & Authorization
- Uses Supabase Auth with email/password authentication
- Row Level Security (RLS) policies control data access
- Two main user roles: ADMIN and USER
- User types: EMPLOYEE and BP (business partner)
- Middleware handles session management and route protection

### Database Schema
Current simplified schema (being migrated to full requirements):
- `announcements` table - Company announcements with publish status
- `users` table - User profiles linked to auth.users
- Planned migration to `profiles` table with enhanced user management per REQUIREMENTS.md

### Key Features
- User authentication and profile management
- Announcement system with admin controls
- Role-based access control
- Responsive design with dark/light theme support
- Admin dashboard for user and announcement management

### File Naming Conventions
- Components use kebab-case (e.g., `auth-button.tsx`)
- Pages follow Next.js App Router conventions
- API routes in `app/api/` directories

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

### Important Implementation Notes
- All database interactions use Supabase client with proper SSR handling
- Components are built with shadcn/ui patterns using Radix UI primitives
- Authentication state is managed through Supabase's built-in session management
- The project is in active development - current schema is simplified and will be expanded per REQUIREMENTS.md