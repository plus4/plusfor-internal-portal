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
- **Theme**: Dark/Light mode with next-themes
- **Date Handling**: date-fns for date formatting and manipulation

### Project Structure
This is a Japanese corporate internal portal with user management and announcements functionality:

- `app/` - Next.js App Router pages and API routes
  - `admin/` - Admin-only pages (user management, announcement management)
    - `announcements/` - Admin announcement management
    - `members/` - Admin user/member management  
    - `layout.tsx` - Admin layout with shared sidebar
  - `dashboard/` - Main dashboard page
  - `auth/` - Authentication pages (login, signup, password reset, etc.)
  - `api/` - API routes for server-side operations
    - `admin/` - Admin-specific API endpoints
    - `announcements/` - Announcement API endpoints
    - `members/` - Member/user API endpoints
    - `profile/` - User profile API endpoints
  - `announcements/` - Public announcements page
  - `members/` - Public members page
  - `profile/` - User profile page
- `components/` - Reusable UI components
  - `announcements/` - Announcement-related components
  - `auth/` - Authentication-related components
  - `members/` - Member/user-related components
  - `ui/` - shadcn/ui base components
  - `sidebar.tsx` - Shared navigation sidebar component
  - `header.tsx` - Application header component
  - `theme-switcher.tsx` - Dark/light theme toggle
- `lib/` - Utilities and shared logic
  - `data/` - Data fetching utilities (announcements, members)
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
- User authentication and profile management with Supabase Auth
- Announcement system with admin controls and read tracking
- Member/user directory with search and filtering
- Role-based access control (ADMIN/USER roles)
- Responsive design with dark/light theme support
- Admin dashboard for user and announcement management
- Shared sidebar navigation component across admin and user pages
- Real-time data updates with Supabase integration
- Professional Japanese corporate UI design

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
- Data fetching logic is centralized in `lib/data/` directory
- Shared sidebar component provides consistent navigation across admin and user sections
- The project follows colocation patterns with feature-specific components organized by domain
- **File Format**: All files must end with a single newline character for consistency and proper Git handling

### Current Development Status
- **Main Branch**: Production-ready base implementation
- **Active Feature Branch**: `feature/issue-20-essential-pages-implementation`
  - Implementing core user-facing pages (announcements, members, profile)
  - Shared sidebar component integration
  - Data layer improvements and optimization

### Branch Structure
- `main` - Production-ready code
- `feature/issue-20-essential-pages-implementation` - Current active development
- `feature/issue-6-admin-role-system` - Admin role and permission system
- `feature/shared-sidebar-component` - Shared navigation component
- `refactor/issue-45-colocation-pattern` - Code organization improvements

### Migration Notes
- Current implementation uses `users` table for user data
- All user-related functionality is built around the `users` table structure
- Future enhancements will continue to build upon this foundation