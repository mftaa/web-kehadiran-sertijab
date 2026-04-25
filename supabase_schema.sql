-- Table: registrations
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  nim TEXT NOT NULL UNIQUE,
  class TEXT NOT NULL,
  study_program TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  is_present BOOLEAN NOT NULL,
  food_allergy TEXT,
  illness_history TEXT,
  has_vehicle BOOLEAN,
  ready_to_drive BOOLEAN,
  payment_method TEXT,
  payment_proof_url TEXT,
  absence_reason TEXT,
  permission_proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Allow public inserts" ON registrations;
DROP POLICY IF EXISTS "Allow authenticated read" ON registrations;
DROP POLICY IF EXISTS "Allow authenticated update" ON registrations;
DROP POLICY IF EXISTS "Allow anon insert" ON registrations;
DROP POLICY IF EXISTS "Allow authenticated select" ON registrations;
DROP POLICY IF EXISTS "Allow authenticated delete" ON registrations;

-- Policies for 'registrations' table
-- 1. Allow anonymous users to insert (Public Registration)
CREATE POLICY "Allow anon insert" ON registrations
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- 2. Allow authenticated users (Admins) to read all registrations
CREATE POLICY "Allow authenticated select" ON registrations
  FOR SELECT 
  TO authenticated 
  USING (true);

-- 3. Allow authenticated users (Admins) to update registrations
CREATE POLICY "Allow authenticated update" ON registrations
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- 4. Allow authenticated users (Admins) to delete registrations
CREATE POLICY "Allow authenticated delete" ON registrations
  FOR DELETE 
  TO authenticated 
  USING (true);


-- Storage Setup (Execute these manually in the SQL Editor)
-- 1. Create the 'proofs' bucket if it doesn't exist
-- INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', true) ON CONFLICT (id) DO NOTHING;

-- Clean up existing storage policies
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth all" ON storage.objects;

-- 2. Allow public uploads to 'proofs' bucket
CREATE POLICY "Allow public upload" ON storage.objects
  FOR INSERT 
  TO anon
  WITH CHECK (bucket_id = 'proofs');

-- 3. Allow public to view/download from 'proofs' bucket
CREATE POLICY "Allow public select" ON storage.objects
  FOR SELECT 
  TO anon
  USING (bucket_id = 'proofs');

-- 4. Allow authenticated users full access to 'proofs' bucket
CREATE POLICY "Allow auth all" ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'proofs');
