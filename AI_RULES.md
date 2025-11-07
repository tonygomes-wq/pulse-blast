# AI Development Rules

This document outlines the rules and conventions for AI-driven development of this application. Adhering to these guidelines ensures consistency, maintainability, and leverages the existing tech stack effectively.

## Tech Stack Overview

This project is built with a modern, type-safe, and component-driven stack:

- **Framework**: React (using Vite for a fast development experience).
- **Language**: TypeScript for static typing and improved developer experience.
- **UI Components**: shadcn/ui, a collection of beautifully designed, accessible components built on Radix UI.
- **Styling**: Tailwind CSS for a utility-first styling approach.
- **Routing**: React Router (`react-router-dom`) for client-side navigation.
- **Backend & Database**: Supabase for authentication, database, and other backend services.
- **Data Fetching**: TanStack Query for managing server state, caching, and data synchronization.
- **Forms**: React Hook Form with Zod for robust and type-safe form handling.
- **Icons**: Lucide React for a comprehensive and consistent set of icons.

## Library Usage Rules

To maintain consistency, please follow these specific rules when adding or modifying features:

1.  **UI Components**:
    - **ALWAYS** use components from the `shadcn/ui` library (`src/components/ui`).
    - **DO NOT** create custom components from scratch if a `shadcn/ui` component can be used or composed.
    - New, complex components should be built by composing `shadcn/ui` primitives.

2.  **Styling**:
    - **ONLY** use Tailwind CSS utility classes for styling.
    - **NEVER** write custom CSS in `.css` files or use inline `style` attributes.
    - Use the `cn` utility function from `src/lib/utils.ts` for conditionally applying classes.

3.  **Icons**:
    - **ALWAYS** use icons from the `lucide-react` package.
    - **DO NOT** add other icon libraries or use inline SVGs.

4.  **Routing**:
    - All application routes **MUST** be defined in `src/App.tsx` using `react-router-dom`.
    - Use the `<Link>` component from `react-router-dom` for internal navigation.

5.  **Data Fetching & State**:
    - For all server-side data (fetching, caching, mutations), **MUST** use TanStack Query (`@tanstack/react-query`).
    - For simple, local component state, use React's `useState` hook. Avoid complex client-side state management libraries.

6.  **Forms**:
    - All forms **MUST** be implemented using `react-hook-form`.
    - Schema validation **MUST** be done with `zod`.

7.  **Notifications**:
    - For user feedback like success or error messages, **ALWAYS** use `toast` from the `sonner` library.

8.  **Backend Interaction**:
    - All communication with the backend (database, auth) **MUST** use the `supabase` client instance imported from `@/integrations/supabase/client`.

9.  **Layout**:
    - All authenticated pages **MUST** be wrapped with the `Layout` component from `src/components/Layout.tsx` to ensure consistent navigation and user session handling.