# Supabase Migration Guide

## Overview

SmartFlow Automation Platform has been migrated from in-memory storage to Supabase PostgreSQL database. This ensures data persistence across server restarts and deployments.

## Setup Instructions

### 1. Run Database Schema Scripts

Two SQL scripts need to be executed in Supabase to set up the database:

- `scripts/001_create_tables.sql` - Creates all necessary tables
- `scripts/002_enable_rls.sql` - Enables Row Level Security policies

You can run these scripts via the Supabase SQL Editor or they will be executed automatically when you connect the integration.

### 2. Environment Variables

All required environment variables are automatically set when you connect Supabase:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
POSTGRES_URL
\`\`\`

### 3. Database Schema

The following tables are created:

- **users** - User accounts with roles (Admin, Staff)
- **products** - Product inventory
- **orders** - Customer orders
- **order_items** - Items within orders
- **workflow_rules** - Automation workflow definitions
- **notification_logs** - Audit trail for notifications

### 4. Row Level Security (RLS)

All tables have RLS enabled with policies that:

- Allow authenticated users to view all data
- Restrict admin-only operations to users with Admin role
- Prevent unauthorized data modification

### 5. File Structure

\`\`\`
lib/
  ├── supabase/
  │   ├── client.ts       (Browser client for client components)
  │   ├── server.ts       (Server client for API routes)
  │   └── middleware.ts   (Authentication middleware)
  └── supabase-service.ts (Service layer with all database operations)

app/
  └── api/
      ├── products/       (Product API endpoints)
      ├── orders/         (Order API endpoints)
      ├── workflows/      (Workflow API endpoints)
      └── notifications/  (Notification API endpoints)

middleware.ts            (Session management)
scripts/
  ├── 001_create_tables.sql
  └── 002_enable_rls.sql
\`\`\`

## Key Features

### Data Persistence

- All data is stored in PostgreSQL database
- Data persists across server restarts and deployments
- No more in-memory data loss

### Security

- Row Level Security (RLS) policies protect data
- Email authentication with Supabase Auth
- Audit logging for all operations

### Performance

- Database indexes on frequently queried columns
- Optimized queries with proper joins
- Connection pooling via Supabase

## Migration Notes

### From In-Memory to Supabase

All API routes have been updated to use the Supabase service layer (`lib/supabase-service.ts`). The in-memory database (`lib/db.ts`) has been replaced with database queries.

### API Response Format

The API responses remain the same, ensuring frontend compatibility:

\`\`\`json
{
  "id": "uuid",
  "name": "Product Name",
  "stock": 100,
  "minStock": 10,
  "price": 29.99,
  "createdAt": "2025-01-01T00:00:00Z"
}
\`\`\`

## Troubleshooting

### Connection Issues

If you see connection errors:

1. Verify Supabase integration is connected
2. Check that environment variables are set correctly
3. Ensure database schema scripts have been run

### Authentication Issues

If you see authentication errors:

1. Verify user is logged in
2. Check that user email is confirmed in Supabase Auth
3. Review RLS policies on table

### Data Not Appearing

If data queries return empty:

1. Verify data exists in the Supabase dashboard
2. Check RLS policies allow SELECT
3. Ensure authenticated user has correct role

## Next Steps

1. Run the SQL schema scripts in Supabase
2. Test API endpoints to verify data persistence
3. Monitor Supabase dashboard for data consistency
4. Set up regular backups in Supabase

For more information on Supabase, visit: https://supabase.com/docs
