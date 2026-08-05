# Customer Support Demo Application

## ⚠️ Demo Application Notice

**This is a demonstration application** built to showcase [Appmixer](https://www.appmixer.com/) integration capabilities and workflow automation features.

### Important Notes

- **Not Production-Ready**: This application is intended for demonstration and learning purposes only
- **Security Considerations**: Before deploying to production, implement proper security hardening including:
  - Secure authentication and authorization mechanisms
  - Rate limiting and API protection
  - Input validation and sanitization
  - Environment-specific security configurations
- **Demo Credentials**: The `.env.example` file contains placeholder values - replace with your own credentials
- **Sample Data**: Includes demo seed data for testing purposes
- **API Authentication**: Demo API uses simple key-based auth - implement OAuth 2.0 or JWT for production

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Purpose

This is a modern customer support ticket management system built to demonstrate a complete support workflow. The application provides a comprehensive dashboard for support agents to manage customer tickets, track conversations, and integrate with external services through Appmixer workflows.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router 6 (SPA mode)
- **Styling**: TailwindCSS 3 with Radix UI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Testing**: Vitest
- **Integration Platform**: Appmixer for workflow automation

## Data Model

### Core Entities

#### Customers
```sql
customers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Support Tickets
```sql
tickets (
  id TEXT PRIMARY KEY,              -- Custom format: TICK-001, TICK-002, etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT CHECK (status IN ('new', 'in-progress', 'waiting-customer', 'resolved')),
  customer_id UUID REFERENCES customers(id),
  assignee TEXT,                    -- Support agent name
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  tags TEXT[]                       -- Array of tags for categorization
)
```

#### Ticket Comments (Conversation History)
```sql
ticket_comments (
  id UUID PRIMARY KEY,
  ticket_id TEXT REFERENCES tickets(id),
  author_id TEXT NOT NULL,          -- User ID from authentication
  author_name TEXT NOT NULL,        -- Display name for the comment
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes vs public replies
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Application Features

### 🎯 Dashboard Overview
- **Kanban Board**: Visual ticket management with drag-and-drop between status columns (New, In Progress, Waiting for Customer, Resolved)
- **Dashboard Statistics**: Real-time metrics showing ticket counts, response times, and customer satisfaction
- **Search & Filtering**: Quick search and filter tickets by status, priority, assignee, and tags

### 🎫 Ticket Management
- **Ticket Creation**: Form-based ticket creation with customer lookup/creation
- **Ticket Details Modal**: Comprehensive view with:
  - Inline editing of title and description
  - Status, priority, and assignee management
  - Tag system for categorization
  - Customer information panel
  - Quick actions (set reminder, escalate, close)

### 💬 Conversation History
- **Real-time Comments**: Full conversation thread for each ticket
- **Internal Notes**: Private notes visible only to support agents (orange styling)
- **Public Replies**: Customer-facing responses (blue styling)
- **User Highlighting**: Current user's comments highlighted with special background
- **Smart Timestamps**: Relative time display ("2 hours ago", "Just now")
- **Reply Toggle**: Switch between public reply and internal note modes

### 🔐 Authentication & Security
- **Supabase Authentication**: Email/password and Google OAuth support
- **User Context**: Comments attributed to authenticated users
- **Role-based Access**: Different UI elements based on user permissions

### 🔗 Integrations & Automation
- **Automation Hub**: Single unified interface for all automation needs, replacing separate Integration Templates and Workflow Automation sections:
  - **Workflows Tab**: Manage all automation flows with three sections:
    - **Active**: Running integrations created from pre-built templates
    - **Pre-built**: Ready-to-use integration templates with configuration wizards
    - **Custom**: User-created workflows with the visual designer
  - **Logs Tab**: View execution logs with flow-specific filtering and real-time insights
  - **Accounts Tab**: Manage connected service accounts and OAuth authorizations
- **Visual Flow Designer**: Embedded Appmixer designer for creating and editing custom workflows
- **Flow Management**: Start, stop, clone, edit, and delete workflows with dropdown actions
- **Tag System**: Organize workflows with custom tags and category filtering
- **Real-time Logs**: Click "See logs" on any workflow to instantly view filtered execution logs
- **Search & Filtering**: Full-text search, category filters, active-only filter, and grid/list view modes
- **External Service Connections**: Connect with popular tools like Slack, Gmail, webhooks, and more

### 🎨 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Mode Support**: Theme switching capability
- **Loading States**: Proper loading indicators throughout the app
- **Error Handling**: Graceful error handling with user-friendly messages
- **Optimistic Updates**: Immediate UI updates for better perceived performance

### 🏗️ Code Architecture
The codebase follows DRY (Don't Repeat Yourself) principles with:
- **Reusable Hooks**: Custom hooks for async operations, form management, and editable fields
- **Factory Patterns**: Appmixer component factories eliminate 230+ lines of duplicated code
- **Centralized Constants**: Single source of truth for ticket statuses, priorities, and configurations
- **Component Composition**: Reusable UI components (badges, modals, loading states, empty states)
- **Type Safety**: Full TypeScript coverage with comprehensive type definitions
- **Code Reduction**: ~550+ lines eliminated through refactoring while maintaining functionality

## Project Structure

```
src/
├── components/
│   ├── dashboard/              # Kanban board and stats components
│   │   ├── KanbanBoard.tsx     # Drag-and-drop ticket board
│   │   ├── TicketCard.tsx      # Individual ticket cards
│   │   └── DashboardStats.tsx  # Statistics display
│   ├── modals/                 # Modal dialogs
│   │   ├── TicketDetailsModal.tsx    # Full ticket details and conversation
│   │   ├── NewWorkflowModal.tsx      # Create new workflow
│   │   ├── TagManagementModal.tsx    # Manage workflow tags
│   │   └── WizardModal.tsx           # Integration configuration wizard
│   ├── sections/               # Major application sections
│   │   ├── AutomationHubSection.tsx  # Workflows, logs, and accounts management
│   │   ├── IntegrationsSection.tsx   # Integration templates browser
│   │   └── WorkflowsSection.tsx      # Legacy workflow section
│   ├── ui/                     # Reusable UI component library (Radix UI + Tailwind)
│   │   ├── status-badge.tsx    # Ticket status badges
│   │   ├── priority-badge.tsx  # Priority level badges
│   │   ├── modal-wrapper.tsx   # Reusable modal wrapper
│   │   ├── loading-spinner.tsx # Loading state components
│   │   └── empty-state.tsx     # Empty list state component
│   ├── FlowCard.tsx            # Workflow card with actions menu
│   ├── FlowsGrid.tsx           # Grid/list layout for workflows
│   ├── LogsView.tsx            # Execution logs viewer with filtering
│   ├── DesignerView.tsx        # Embedded visual workflow designer
│   ├── AccountsView.tsx        # Connected accounts management
│   └── NewTicketForm.tsx       # Ticket creation form
├── contexts/                   # React context providers
│   ├── AuthContext.tsx         # Authentication state management
│   ├── AppmixerContextSimple.tsx # Appmixer SDK initialization
│   └── DemoModeContext.tsx     # Demo mode state
├── hooks/                      # Custom React hooks
│   ├── use-appmixer-api.ts     # Appmixer API operations
│   ├── use-insights-logs.ts    # Logs widget integration
│   ├── use-async-operation.ts  # Async state management with loading/error handling
│   ├── use-editable-field.ts   # Edit mode state management
│   ├── use-form-field.ts       # Form field state with validation
│   └── use-confirm-dialog.tsx  # Reusable confirmation dialogs
├── lib/                        # Utility libraries
│   ├── database.ts             # Database operations and API calls
│   ├── supabase.ts             # Supabase client configuration
│   ├── appmixer-api-client.ts  # Appmixer API client
│   ├── appmixer-api-types.ts   # TypeScript types for Appmixer
│   ├── constants.ts            # Application-wide constants (statuses, priorities, etc.)
│   └── utils.ts                # General utility functions
├── pages/                      # Route components
│   ├── Index.tsx               # Main dashboard page
│   ├── Login.tsx               # Authentication page
│   └── NotFound.tsx            # 404 page
├── types/                      # TypeScript type definitions
│   └── support.ts              # Support ticket types
└── main.tsx                    # Application entry point
```

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account and project

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run database migrations: `supabase db push`
5. Seed the database: `supabase db reset`

### Available Commands
- `npm run dev` - Start development server (port 5173 by default)
- `npm run dev-server` - Start mock API server for development (port 3001)
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run unit tests
- `npm run format.fix` - Format code with Prettier

### Environment Variables
Create a `.env` file based on `.env.example`:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Appmixer Configuration
VITE_APPMIXER_BASE_URL=your_appmixer_base_url
VITE_APPMIXER_API_KEY=your_appmixer_api_key
VITE_APPMIXER_VIRTUAL_USER_TOKEN=your_virtual_user_token
```

### Database Management
The application uses Supabase for data persistence:
- **Migrations**: Located in `supabase/migrations/`
- **Seed Data**: Sample data in `supabase/seed.sql` and `supabase/demo-seed-data.sql`
- **Real-time**: Automatic updates when data changes
- **Mock API**: Development server in `dev-server.js` for testing without Supabase

### API Structure
The application includes REST API endpoints in the `api/` directory for integration with Appmixer components:
- `api/tickets/` - Ticket CRUD operations
- `api/customers/` - Customer management
- `api/comments/` - Comment operations
- `api/tags/` - Tag management and statistics

These endpoints are used by the custom Appmixer components and can be called directly for external integrations.

### Custom Appmixer Components
The project includes a custom Appmixer module (`yoursaas`) with components for the support system, located in `src/appmixer/yoursaas/`.

**Architecture Note**: The Appmixer components have been refactored to use factory patterns for code reuse and consistency:
- **triggerBase.js** - Factory for creating trigger components (NewTicket, NewCustomer, etc.)
- **listHandler.js** - Factory for list/fetch operations (ListTickets, ListCustomers, etc.)
- **crudHandler.js** - Factory for CRUD operations (Create, Get, Update, Delete)
- **commons.js** - Shared utilities for authentication, transformations, and API calls

This architecture reduces code duplication by ~230 lines while ensuring consistent behavior across all components.

#### Ticket Management Components
- `CreateTicket` - Create new support tickets
- `GetTicket` - Retrieve ticket details by ID
- `ListTickets` - List all tickets with filtering
- `UpdateTicket` - Update ticket properties
- `SearchTickets` - Full-text search across tickets
- `GetCustomerTickets` - Get tickets for a specific customer
- `GetTicketStats` - Calculate ticket metrics and statistics
- `NewTicket` - Webhook trigger for new ticket events
- `TicketStatusChanged` - Webhook trigger for status changes
- `TicketPriorityChanged` - Webhook trigger for priority changes

#### Customer Management Components
- `CreateCustomer` - Create new customer records
- `GetCustomer` - Retrieve customer details
- `ListCustomers` - List all customers
- `UpdateCustomer` - Update customer information
- `NewCustomer` - Webhook trigger for new customer events

#### Comment Management Components
- `AddComment` - Add comments to tickets
- `ListComments` - List comments for a ticket
- `UpdateComment` - Update existing comments
- `DeleteComment` - Remove comments
- `NewComment` - Webhook trigger for new comment events

#### Tag Management Components
- `CreateTag` - Create new tags
- `ListTags` - List all available tags
- `GetTagStats` - Get statistics for tags
- `UpdateTag` - Update tag properties
- `DeleteTag` - Remove tags
- `AddTagsToTicket` - Associate tags with tickets
- `GetTicketTags` - Get tags for a specific ticket
- `RemoveTagFromTicket` - Remove tag associations
- `GetTicketsByTags` - Filter tickets by tags
- `GetPopularTags` - Get most frequently used tags
- `NewTag` - Webhook trigger for new tag events
- `TicketTagged` - Webhook trigger for ticket tagging events

These components enable building automation workflows that interact with the support system, such as:
- Auto-assign tickets based on keywords or priority
- Send Slack notifications when high-priority tickets are created
- Sync customer data with external CRM systems
- Generate reports on ticket resolution times
- Escalate tickets that haven't been updated in X hours

## Key Features in Detail

### Ticket Lifecycle Management
Tickets flow through four main statuses with visual indicators:
- **New** (Blue) - Freshly created tickets awaiting initial response
- **In Progress** (Yellow) - Tickets being actively worked on
- **Waiting for Customer** (Purple) - Awaiting customer response or action
- **Resolved** (Green) - Completed tickets

### Priority System
Four priority levels with color coding:
- **Low** (Blue) - Non-urgent feature requests or minor issues
- **Medium** (Yellow) - Standard support requests
- **High** (Orange) - Important issues affecting user experience
- **Urgent** (Red) - Critical issues requiring immediate attention

### Conversation Threading
- Chronological display of all ticket interactions
- Support agent responses and customer messages
- Internal team notes for coordination
- Visual distinction between message types
- User identification and timestamp tracking

### Automation & Integration Capabilities

#### Automation Hub
The Automation Hub is the central control center for all workflow automation:
- **Three-Tab Interface**:
  - **Workflows**: Browse and manage Pre-built templates, Active integrations, and Custom workflows
  - **Logs**: Real-time execution logs with flow-specific filtering via Appmixer InsightsLogs widget
  - **Accounts**: Manage OAuth connections and API credentials for external services

#### Workflow Management
- **Flow Types**:
  - **Pre-built Templates** (`integration-template`): Ready-to-use integrations with wizards
  - **Active Integrations** (`integration-instance`): Running instances created from templates
  - **Custom Workflows** (`automation`): User-created flows with visual designer
- **Flow Actions**: Start/stop, clone, edit in designer, manage tags, view logs, delete
- **Tag-based Organization**: Categorize flows with custom tags and filter by category
- **Search & Filtering**: Full-text search, active-only filter, grid/list view modes

#### Visual Workflow Designer
- Embedded Appmixer flow designer with drag-and-drop component placement
- Connect services with pre-built connectors (Slack, Gmail, webhooks, etc.)
- Configure component properties and mappings
- Real-time validation and error checking

#### Logs & Monitoring
- **Flow-Specific Logs**: Click "See logs" on any workflow card to view filtered execution logs
- **InsightsLogs Widget**: Real-time log streaming with component-level details
- **Clear Filter**: Easy navigation back to all logs view
- **Log Context**: Displays flow name and filtering status

#### Integration Features
- **Wizard-based Configuration**: Step-by-step setup for pre-built integrations
- **OAuth Management**: Secure authentication flow for external services
- **API Integration**: RESTful API for external system integration
- **Real-time Updates**: Automatic UI refresh when flows start/stop

This application demonstrates a production-ready customer support system with modern development practices, comprehensive Appmixer integration, workflow automation capabilities, and scalable architecture patterns.