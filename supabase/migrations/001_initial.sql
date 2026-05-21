-- TABLES

CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  roll_no TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dob DATE,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('faculty', 'admin', 'superadmin')),
  class_assigned TEXT,
  subject TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'holiday')),
  marked_by UUID REFERENCES auth.users(id),
  class TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id UUID NOT NULL REFERENCES fee_structures(id),
  amount_due NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  receipt_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, fee_structure_id)
);

-- RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

-- Service role full access (all API routes use service role key)
CREATE POLICY "service_all_students"     ON students     FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_staff"        ON staff        FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_attendance"   ON attendance   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_fee_structs"  ON fee_structures FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_fee_payments" ON fee_payments  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- SEED DATA

INSERT INTO students (name, class, section, roll_no, parent_name, parent_phone) VALUES
  ('Aarav Sharma',   'JKG', 'A', '01', 'Mr. Raj Sharma',     '+91 98765 43210'),
  ('Diya Patel',     'JKG', 'A', '02', 'Mrs. Meena Patel',   '+91 87654 32109'),
  ('Ishaan Gupta',   'JKG', 'A', '03', 'Mr. Suresh Gupta',   '+91 76543 21098'),
  ('Priya Singh',    'JKG', 'A', '04', 'Mrs. Anita Singh',   '+91 65432 10987'),
  ('Arjun Mehta',    'JKG', 'A', '05', 'Mr. Vikram Mehta',   '+91 54321 09876'),
  ('Ananya Joshi',   'JKG', 'A', '06', 'Mrs. Neha Joshi',    '+91 43219 87654'),
  ('Vihaan Verma',   'JKG', 'A', '07', 'Mr. Rahul Verma',    '+91 32198 76543'),
  ('Anika Tiwari',   'JKG', 'A', '08', 'Mrs. Sunita Tiwari', '+91 21987 65432'),
  ('Reyansh Kumar',  'SKG', 'A', '01', 'Mr. Anil Kumar',     '+91 98761 23450'),
  ('Saanvi Rao',     'SKG', 'A', '02', 'Mrs. Lakshmi Rao',   '+91 87652 34501'),
  ('Kabir Malhotra', 'SKG', 'A', '03', 'Mr. Deepak Malhotra','+91 76543 45012'),
  ('Myra Saxena',    'SKG', 'A', '04', 'Mrs. Pooja Saxena',  '+91 65434 50123'),
  ('Ayaan Khan',     'LKG', 'A', '01', 'Mr. Salim Khan',     '+91 54325 01234'),
  ('Pari Kapoor',    'LKG', 'A', '02', 'Mrs. Kavita Kapoor', '+91 43216 12345'),
  ('Dhruv Agarwal',  'LKG', 'A', '03', 'Mr. Mohan Agarwal',  '+91 32107 23456'),
  ('Kiara Nair',     'Nursery', 'A', '01', 'Mrs. Priya Nair','+91 21098 34567'),
  ('Vivaan Bose',    'Nursery', 'A', '02', 'Mr. Souvik Bose', '+91 10989 45678'),
  ('Navya Pillai',   'Nursery', 'A', '03', 'Mrs. Rekha Pillai','+91 99870 56789')
ON CONFLICT DO NOTHING;

INSERT INTO fee_structures (name, term, academic_year, amount, due_date, description) VALUES
  ('Term 1 — April Instalment',    'Term 1', '2026-27', 20000, '2026-04-30', 'Monthly tuition fee'),
  ('Term 1 — May Instalment',      'Term 1', '2026-27', 20000, '2026-05-31', 'Monthly tuition fee'),
  ('Term 1 — June Instalment',     'Term 1', '2026-27', 20000, '2026-06-30', 'Monthly tuition fee'),
  ('Term 2 — July Instalment',     'Term 2', '2026-27', 20000, '2026-07-31', 'Monthly tuition fee'),
  ('Term 2 — August Instalment',   'Term 2', '2026-27', 20000, '2026-08-31', 'Monthly tuition fee'),
  ('Term 2 — September Instalment','Term 2', '2026-27', 20000, '2026-09-30', 'Monthly tuition fee')
ON CONFLICT DO NOTHING;
