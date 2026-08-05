# Supabase Database Setup

This directory contains the database migrations and seed data for the Customer Support App.

## Setup Instructions

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase** (if not already done):
   ```bash
   supabase init
   ```

3. **Link to your Supabase project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. **Run migrations**:
   ```bash
   supabase db push
   ```

   Or apply migrations individually:
   ```bash
   # Create customers table
   supabase db push --file ./migrations/001_create_customers_table.sql
   
   # Create tickets table
   supabase db push --file ./migrations/002_create_tickets_table.sql
   ```

5. **Seed the database with sample data**:
   ```bash
   # Reset database and apply migrations + seed data
   supabase db reset --linked
   ```
   
   The `supabase/seed.sql` file will be automatically executed after migrations.

## Manual Setup (Alternative)

If you prefer to set up manually through the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Execute the migration files in order:
   - `./migrations/001_create_customers_table.sql`
   - `./migrations/002_create_tickets_table.sql`
4. Execute the seed file:
   - `./seed.sql`

## Environment Variables

Make sure your `.env.local` file contains:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

### Customers Table
- `id` (UUID, Primary Key)
- `name` (Text)
- `email` (Text, Unique) - Used for customer lookup
- `avatar` (Text, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Tickets Table
- `id` (Text, Primary Key) - Sequential format: TICK-001, TICK-002, etc.
- `title` (Text)
- `description` (Text)
- `priority` (Enum: low, medium, high, urgent)
- `status` (Enum: new, in-progress, waiting-customer, resolved)
- `customer_id` (UUID, Foreign Key to customers)
- `assignee` (Text, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `tags` (Array of Text)

## Smart Ticket Creation

When creating new tickets through the "New Ticket Simulation":

1. **Sequential Ticket IDs**: The system automatically generates the next sequential ticket ID (e.g., if the last ticket is TICK-015, the next will be TICK-016)

2. **Customer Lookup/Creation**: 
   - The system first checks if a customer with the provided email exists
   - If found, it uses the existing customer record
   - If not found, it creates a new customer record first
   - Then creates the ticket associated with that customer

This ensures no duplicate customers and maintains proper relationships between tickets and customers.

## Row Level Security (RLS)

Currently, RLS is not enabled. For production use, you should:

1. Enable RLS on both tables
2. Create appropriate policies for your authentication system
3. Set up proper access controls based on user roles