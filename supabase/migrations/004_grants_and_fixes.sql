-- 004_grants_and_fixes.sql
-- Grant schema, table, and RPC execution permissions to Supabase roles.
-- Row Level Security (RLS) policies still enforce all row-level access rules.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
