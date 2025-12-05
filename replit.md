# Al Thenayan Farms E-commerce Platform

## Overview

Al Thenayan Farms is a bilingual (Arabic/English) e-commerce platform for selling fresh farm products including fish, duck, eggs, goats, and pigeons. The application features a modern, culturally-authentic design with Arabic-first RTL support, product catalog management, and shopping cart functionality. Built as a full-stack application with React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite as the build tool

**UI Component System**: shadcn/ui components built on Radix UI primitives, providing a comprehensive set of accessible, customizable components including buttons, cards, dialogs, dropdowns, and form elements.

**Styling Approach**: Tailwind CSS with custom color tokens and RTL support. The design system uses CSS variables for theming with a warm, earth-toned color palette (primary orange #E37E16, accent blue #4770DB, cream background #FEF8F3).

**State Management**:
- React Context API for global state (Language and Cart contexts)
- TanStack Query (React Query) for server state management and API caching
- Local state with React hooks for component-level state

**Routing**: wouter for client-side routing (lightweight alternative to React Router)

**Internationalization**: Custom context-based solution supporting Arabic (RTL) and English (LTR) with language persistence in localStorage. The `t()` helper function handles translation throughout the app.

**Key Features**:
- Bilingual support with automatic RTL/LTR layout switching
- Responsive design with mobile-first approach
- Shopping cart with slide-out panel
- Product browsing with category filtering
- Hero carousel for featured products
- Instagram feed integration

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful API endpoints for products, categories, and cart management

**Development Mode**: Vite middleware integration for HMR (Hot Module Replacement) during development

**Build Process**: Custom build script using esbuild for server bundling and Vite for client bundling, with selective dependency bundling to optimize cold start times

**Key Endpoints**:
- `GET /api/products` - Fetch all products
- `GET /api/products/:id` - Fetch single product
- `GET /api/products/category/:category` - Filter by category
- `GET /api/categories` - List all categories
- Cart management endpoints (in-memory storage)

### Data Storage

**ORM**: Drizzle ORM configured for PostgreSQL with schema definitions in TypeScript

**Database Schema**:
- `users` table: User authentication (id, username, password)
- `products` table: Product catalog (id, nameAr, nameEn, price, image, category, inStock, unit)
- `cartItems` table: Shopping cart items (id, productId, quantity, sessionId)

**Current Implementation**: In-memory storage using Map data structures as a fallback/development solution. The schema is defined for PostgreSQL but the application can run without a database connection using the MemStorage implementation.

**Data Initialization**: Hardcoded product data with fallback images and multilingual names for initial catalog

### Authentication & Authorization

**Strategy**: Basic user authentication schema defined (username/password) but not currently implemented in the application flow. The infrastructure exists for future authentication features.

**Session Management**: Session handling configured via connect-pg-simple (PostgreSQL session store) for production use, though not actively used in current implementation.

### External Dependencies

**UI Framework**:
- Radix UI component primitives (@radix-ui/react-*)
- shadcn/ui component library
- Tailwind CSS for styling
- class-variance-authority for component variant management

**State & Data Fetching**:
- TanStack Query for server state
- React Hook Form with Zod resolvers for form validation

**Image Assets**: Generated product images stored in `/attached_assets/generated_images/` directory, including hero images for each product category and individual product shots

**Fonts**: Google Fonts (Open Sans) loaded via CDN for consistent typography across Arabic and English text

**Utilities**:
- date-fns for date manipulation
- clsx and tailwind-merge for conditional styling
- nanoid for unique ID generation
- Embla Carousel for the hero carousel component

**Icons**:
- lucide-react for general UI icons
- react-icons (specifically GI icons) for category-specific icons

**Development Tools**:
- Replit-specific plugins for development environment integration
- TypeScript with strict mode enabled
- PostCSS with Autoprefixer

**Build & Deployment**:
- Vite for frontend bundling
- esbuild for server-side bundling
- tsx for TypeScript execution in development