# Database Migrations

This directory contains SQL migration files for setting up the CallTree database in Supabase.

## Running Migrations

### Option 1: Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard: https://bymmpmklzktwwumsczck.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of each migration file in order:
   - First: `01_initial_schema.sql`
   - Second: `02_row_level_security.sql`
5. Click **Run** for each migration

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your Supabase project
supabase link --project-ref bymmpmklzktwwumsczck

# Apply migrations
supabase db push
```

## Migration Files

### 01_initial_schema.sql
Creates the core database tables:
- `organizations` - Organization/tenant data
- `profiles` - User profiles (extends auth.users)
- `calling_trees` - Emergency notification trees
- `tree_nodes` - Hierarchical tree structure
- `notifications` - Emergency broadcasts
- `notification_logs` - Individual notification tracking
- `documents` - Emergency resource files
- `push_tokens` - Device push notification tokens

Also creates:
- Indexes for query performance
- Triggers for automatic `updated_at` timestamps

### 02_row_level_security.sql
Implements Row Level Security (RLS) policies:
- Organization-level data isolation
- Role-based access control (admin, manager, member)
- User-specific data access (e.g., own profile, own push tokens)
- Ensures users can only access their organization's data

## Verification

After running migrations, verify they worked:

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Next Steps

After migrations are applied:
1. Create your first organization
2. Set up user profiles
3. Configure OAuth providers (Google, Apple)
4. Test the RLS policies

## Troubleshooting

If you get errors:
- Ensure you're using the correct database (check project URL)
- Run migrations in order (01, then 02)
- Check for syntax errors in the SQL Editor
- Verify the `uuid-ossp` extension is enabled

