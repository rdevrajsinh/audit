# Audit Capsule - IT Security Audit SaaS Platform

## Overview

Audit Capsule is a full-stack SaaS application designed for automated IT security audits targeting Small and Medium Enterprises (SMEs). The platform provides comprehensive security assessment capabilities including asset discovery, vulnerability scanning, IAM auditing, compliance scoring, and automated report generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful APIs with conventional HTTP methods
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Build System**: Vite for frontend, esbuild for backend

### Multi-Tenant Design
The application implements organization-based multi-tenancy where:
- Users belong to organizations
- All data is scoped by organizationId
- Role-based access control (super_admin, org_admin, auditor, user)
- Shared database with tenant isolation at the application layer

## Key Components

### Database Schema (Drizzle ORM with PostgreSQL)
- **Users Table**: Stores user profiles, roles, and organization associations
- **Organizations Table**: Multi-tenant organization management
- **Assets Table**: Digital asset inventory (web apps, servers, databases, cloud services)
- **Scan Jobs Table**: Vulnerability and security scan management
- **Vulnerabilities Table**: Security findings and assessments
- **IAM Records Table**: Identity and access management audit results
- **Compliance Scores Table**: Framework compliance tracking (ISO 27001, SOC 2, GDPR)
- **Reports Table**: Generated security reports and documentation
- **Sessions Table**: User session persistence

### Core Features Implementation
1. **Asset Discovery**: Automated cataloging of digital infrastructure
2. **Vulnerability Scanning**: Security assessment using industry tools
3. **IAM Auditing**: Identity management across platforms (AWS, Google Workspace, Microsoft 365)
4. **Compliance Reporting**: Framework-specific compliance scoring
5. **Report Generation**: Executive and technical PDF reports

### Authentication Flow
- Replit Auth integration for secure user authentication
- OpenID Connect protocol implementation
- Session-based authentication with PostgreSQL storage
- Role-based access control throughout the application

## Data Flow

1. **User Authentication**: Replit Auth → Express Session → Database User Lookup
2. **API Requests**: Frontend → Express Routes → Storage Layer → Database
3. **Multi-tenant Data Access**: Organization ID filtering at storage layer
4. **Real-time Updates**: TanStack Query for optimistic updates and cache management

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL with connection pooling
- **ORM**: Drizzle with Zod schema validation
- **Authentication**: Replit Auth with OpenID Connect
- **UI Library**: Radix UI components with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Date Handling**: date-fns for date manipulation

### Development Tools
- **Type Safety**: TypeScript with strict configuration
- **Code Quality**: ESLint configuration (implied)
- **Build Tools**: Vite (frontend), esbuild (backend)
- **Database Migrations**: Drizzle Kit for schema management

### Planned Integrations
- Security scanning tools (OWASP ZAP, Nmap)
- Cloud platform APIs (AWS, Google Cloud, Azure)
- PDF generation for reports
- Email/Slack notifications

## Deployment Strategy

### Current Setup
- **Development**: Replit environment with hot reload
- **Build Process**: Separate frontend and backend builds
- **Database**: Neon PostgreSQL with environment-based configuration
- **Session Storage**: PostgreSQL-backed sessions

### Production Considerations
- **Containerization**: Dockerfile ready (implied by build scripts)
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS
- **Static Assets**: Vite build output to dist/public
- **Backend**: Compiled to dist/index.js with external dependencies

### Scalability Design
- **Database**: Connection pooling with Neon serverless
- **Multi-tenancy**: Organization-scoped data isolation
- **API Design**: RESTful with proper HTTP status codes
- **Frontend**: Component-based architecture for maintainability

The application follows modern full-stack development practices with a focus on security, scalability, and maintainability. The architecture supports both the current MVP requirements and future expansion into enterprise-grade features.

## Recent Changes

### Database Setup Complete (January 23, 2025)
✓ PostgreSQL database provisioned and configured
✓ All environment variables (DATABASE_URL, PGPORT, PGUSER, etc.) automatically set
✓ Database schema pushed successfully using Drizzle Kit
✓ All required secret keys verified (SESSION_SECRET, REPL_ID, REPLIT_DOMAINS)
✓ Application server started and running on port 5000
✓ DatabaseStorage implementation active for all data operations