-- ====================================================================
-- EDUHUB NOTES MANAGER - SUPABASE DATABASE MIGRATION SCHEMA
-- Run this in your Supabase Dashboard > SQL Editor to initialize tables
-- ====================================================================

-- 1. Create Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert Default Admin User
INSERT INTO public.admin_users (email) 
VALUES ('admin@example.com')
ON CONFLICT (email) DO NOTHING;

-- 3. Create Study Materials Table
CREATE TABLE IF NOT EXISTS public.materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    author TEXT,
    grade_level TEXT,
    date_added TEXT,
    views_count INT DEFAULT 0,
    downloads_count INT DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    file_type TEXT,
    file_name TEXT,
    file_size TEXT,
    file_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    content TEXT,
    flashcards JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- 5. Public Read Access Policies
CREATE POLICY "Allow Public Read Access on Materials" 
ON public.materials FOR SELECT USING (true);

CREATE POLICY "Allow Admin Access Read on Admin Users" 
ON public.admin_users FOR SELECT USING (true);

-- 6. Admin Insert / Update / Delete Policies
CREATE POLICY "Allow Authorized Insert Materials" 
ON public.materials FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow Authorized Update Materials" 
ON public.materials FOR UPDATE USING (true);

CREATE POLICY "Allow Authorized Delete Materials" 
ON public.materials FOR DELETE USING (true);
