-- SQL Schema for migrating WAST Database to Supabase
-- Copy and paste this script directly into your Supabase SQL Editor (https://supabase.com)

-- 1. Create USERS Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'user', 'seller', 'developer'
    balance NUMERIC NOT NULL DEFAULT 0,
    "profilePic" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert access on users" ON public.users;
DROP POLICY IF EXISTS "Allow public update access on users" ON public.users;
CREATE POLICY "Allow public read access on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on users" ON public.users FOR UPDATE USING (true);

-- 2. Create PRODUCTS Table
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    "imageUrl" TEXT,
    description TEXT,
    "sellerId" TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
DROP POLICY IF EXISTS "Allow public write access on products" ON public.products;
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public write access on products" ON public.products FOR ALL USING (true);

-- 3. Create TRANSACTIONS Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    "buyerId" TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    "sellerId" TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    "productId" BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
    "productName" TEXT NOT NULL,
    price NUMERIC NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    timestamp TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public write access on transactions" ON public.transactions;
CREATE POLICY "Allow public read access on transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Allow public write access on transactions" ON public.transactions FOR ALL USING (true);

-- 4. Create CHATS Table
CREATE TABLE IF NOT EXISTS public.chats (
    id TEXT PRIMARY KEY,
    "senderId" TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    "receiverId" TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    text TEXT,
    timestamp TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on chats" ON public.chats;
DROP POLICY IF EXISTS "Allow public write access on chats" ON public.chats;
CREATE POLICY "Allow public read access on chats" ON public.chats FOR SELECT USING (true);
CREATE POLICY "Allow public write access on chats" ON public.chats FOR ALL USING (true);

-- 5. Create BANNER Table
CREATE TABLE IF NOT EXISTS public.banner (
    id TEXT PRIMARY KEY,
    "imageUrl" TEXT,
    title TEXT,
    subtitle TEXT,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "bgColor" TEXT,
    "accentColor" TEXT,
    "titleColor" TEXT,
    "subtitleColor" TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for banner
ALTER TABLE public.banner ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on banner" ON public.banner;
DROP POLICY IF EXISTS "Allow public write access on banner" ON public.banner;
CREATE POLICY "Allow public read access on banner" ON public.banner FOR SELECT USING (true);
CREATE POLICY "Allow public write access on banner" ON public.banner FOR ALL USING (true);

-- 6. Create BRANDING Table for settings
CREATE TABLE IF NOT EXISTS public.branding (
    key TEXT PRIMARY KEY DEFAULT 'branding',
    "logoUrl" TEXT,
    title TEXT,
    "titleColor" TEXT,
    "textColor" TEXT,
    "themeColor" TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for branding
ALTER TABLE public.branding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on branding" ON public.branding;
DROP POLICY IF EXISTS "Allow public write access on branding" ON public.branding;
CREATE POLICY "Allow public read access on branding" ON public.branding FOR SELECT USING (true);
CREATE POLICY "Allow public write access on branding" ON public.branding FOR ALL USING (true);

-- Insert initial default branding row
INSERT INTO public.branding (key, title, "titleColor", "textColor", "themeColor")
VALUES ('branding', 'WAST', '#ffffff', '#a1a1aa', '#0084ff')
ON CONFLICT (key) DO NOTHING;

-- 7. ENABLE REALTIME FOR ALL TABLES
-- This is critical for the app to sync live!
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;
ALTER PUBLICATION supabase_realtime ADD TABLE users, products, transactions, chats, banner, branding;
