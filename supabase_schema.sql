-- Table: registrations
CREATE TABLE registrations (
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

-- Policies
-- 1. Allow public to insert registrations (Public Registration)
CREATE POLICY "Allow public inserts" ON registrations
  FOR INSERT WITH CHECK (true);

-- 2. Allow authenticated users (Admins) to read all registrations
CREATE POLICY "Allow authenticated read" ON registrations
  FOR SELECT TO authenticated USING (true);

-- 3. Allow authenticated users (Admins) to update registrations (Verification)
CREATE POLICY "Allow authenticated update" ON registrations
  FOR UPDATE TO authenticated USING (true);

-- Storage: proofs bucket (must be created manually in Supabase Dashboard or via API)
-- Assuming the bucket name is 'proofs'
-- Policies for 'proofs' bucket:
-- 1. Allow public uploads
-- 2. Allow authenticated users to read/download
