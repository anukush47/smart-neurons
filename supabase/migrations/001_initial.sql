-- ============================================================
-- Smart Neurons ERP — Initial Schema + Seed Data
-- Academic Year 2026-27  |  School: Smart Neurons Preschool, Bhopal
-- ============================================================

-- TABLES

CREATE TABLE IF NOT EXISTS students (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT NOT NULL,
  class          TEXT NOT NULL,
  section        TEXT NOT NULL DEFAULT 'A',
  roll_no        TEXT,
  parent_name    TEXT,
  parent_phone   TEXT,
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dob            DATE,
  photo_url      TEXT,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  role           TEXT NOT NULL CHECK (role IN ('faculty', 'admin', 'superadmin')),
  class_assigned TEXT,
  subject        TEXT,
  phone          TEXT,
  email          TEXT,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'holiday')),
  marked_by  UUID REFERENCES auth.users(id),
  class      TEXT,
  remarks    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS fee_structures (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  term          TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2026-27',
  amount        NUMERIC(10,2) NOT NULL,
  due_date      DATE NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id    UUID NOT NULL REFERENCES fee_structures(id),
  amount_due          NUMERIC(10,2) NOT NULL,
  amount_paid         NUMERIC(10,2) DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  due_date            DATE NOT NULL,
  paid_at             TIMESTAMPTZ,
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  receipt_no          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, fee_structure_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE students       ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff          ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance     ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_all_students"     ON students       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_staff"        ON staff          FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_attendance"   ON attendance     FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_fee_structs"  ON fee_structures FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_fee_payments" ON fee_payments   FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: STUDENTS — 15 students, 3 per class across 5 classes
-- ============================================================
--
-- Class       Teacher           Students
-- Nursery-A   Aarav Kumar       Aarav Sharma, Priya Verma, Rohan Patel
-- LKG-A       Neha Sharma       Sneha Gupta, Aditya Singh, Kavya Nair
-- UKG-A       Rohan Singh       Rahul Mehta, Ananya Das, Vivek Joshi
-- JKG-A       Priya Patel       Isha Kapoor, Arjun Rao, Meera Iyer
-- SKG-A       Vikram Verma      Siddharth Jain, Pooja Malhotra, Kunal Mishra
--
-- Parent phone = login credential for parent role

INSERT INTO students (name, class, section, roll_no, parent_name, parent_phone, dob) VALUES
  ('Aarav Sharma',   'Nursery', 'A', '01', 'Mr. Raj Sharma',      '+91 98765 43210', '2022-03-15'),
  ('Priya Verma',    'Nursery', 'A', '02', 'Mrs. Sunita Verma',   '+91 87654 32109', '2022-07-22'),
  ('Rohan Patel',    'Nursery', 'A', '03', 'Mr. Dinesh Patel',    '+91 76543 21098', '2022-01-10'),

  ('Sneha Gupta',    'LKG',     'A', '01', 'Mr. Anil Gupta',      '+91 65432 10987', '2021-05-18'),
  ('Aditya Singh',   'LKG',     'A', '02', 'Mrs. Kavita Singh',   '+91 54321 09876', '2021-09-30'),
  ('Kavya Nair',     'LKG',     'A', '03', 'Mr. Suresh Nair',     '+91 43210 98765', '2021-12-25'),

  ('Rahul Mehta',    'UKG',     'A', '01', 'Mr. Vijay Mehta',     '+91 32109 87654', '2020-08-14'),
  ('Ananya Das',     'UKG',     'A', '02', 'Mrs. Priyanka Das',   '+91 21098 76543', '2020-04-20'),
  ('Vivek Joshi',    'UKG',     'A', '03', 'Mr. Ramesh Joshi',    '+91 10987 65432', '2020-11-05'),

  ('Isha Kapoor',    'JKG',     'A', '01', 'Mrs. Meena Kapoor',   '+91 99876 54321', '2021-02-28'),
  ('Arjun Rao',      'JKG',     'A', '02', 'Mr. Krishna Rao',     '+91 88765 43210', '2021-06-15'),
  ('Meera Iyer',     'JKG',     'A', '03', 'Mrs. Lakshmi Iyer',   '+91 77654 32109', '2021-10-08'),

  ('Siddharth Jain', 'SKG',     'A', '01', 'Mr. Mahesh Jain',     '+91 66543 21098', '2020-01-20'),
  ('Pooja Malhotra', 'SKG',     'A', '02', 'Mrs. Ritu Malhotra',  '+91 55432 10987', '2020-06-12'),
  ('Kunal Mishra',   'SKG',     'A', '03', 'Mr. Shiv Mishra',     '+91 44321 09876', '2020-09-18')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: STAFF — 5 faculty + 2 named admins
-- ============================================================

INSERT INTO staff (name, role, class_assigned, subject, phone, email) VALUES
  ('Aarav Kumar',   'faculty', 'Nursery-A', 'Class Teacher — Nursery A', '+91 98765 11111', 'aarav@smartneurons.in'),
  ('Neha Sharma',   'faculty', 'LKG-A',     'Class Teacher — LKG A',     '+91 87654 22222', 'neha@smartneurons.in'),
  ('Rohan Singh',   'faculty', 'UKG-A',     'Class Teacher — UKG A',     '+91 76543 33333', 'rohan@smartneurons.in'),
  ('Priya Patel',   'faculty', 'JKG-A',     'Class Teacher — JKG A',     '+91 65432 44444', 'priya@smartneurons.in'),
  ('Vikram Verma',  'faculty', 'SKG-A',     'Class Teacher — SKG A',     '+91 54321 55555', 'vikram@smartneurons.in'),
  ('Khushboo P',    'admin',   NULL,         NULL,                        '+91 43210 66666', 'khushboo.p@smartneurons.in'),
  ('Ms. Principal', 'admin',   NULL,         NULL,                        '+91 32109 77777', 'principal@smartneurons.in')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: FEE STRUCTURES — 6 monthly instalments AY 2026-27
-- ============================================================

INSERT INTO fee_structures (name, term, academic_year, amount, due_date, description) VALUES
  ('Term 1 — April Instalment',     'Term 1', '2026-27', 20000, '2026-04-30', 'Monthly tuition + activity fee'),
  ('Term 1 — May Instalment',       'Term 1', '2026-27', 20000, '2026-05-31', 'Monthly tuition + activity fee'),
  ('Term 1 — June Instalment',      'Term 1', '2026-27', 20000, '2026-06-30', 'Monthly tuition + activity fee'),
  ('Term 2 — July Instalment',      'Term 2', '2026-27', 20000, '2026-07-31', 'Monthly tuition + activity fee'),
  ('Term 2 — August Instalment',    'Term 2', '2026-27', 20000, '2026-08-31', 'Monthly tuition + activity fee'),
  ('Term 2 — September Instalment', 'Term 2', '2026-27', 20000, '2026-09-30', 'Monthly tuition + activity fee')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: ATTENDANCE — April + May 2026 working days
-- Deterministic pattern: (name_length + day) % 10
--   = 3 → absent  |  = 7 → late  |  else → present
-- Gives ~80% present, ~10% absent, ~10% late
-- ============================================================

-- May 2026 (14 working days: 1,4–8,11–15,18–20)
INSERT INTO attendance (student_id, date, status, class)
SELECT
  s.id,
  d.day,
  CASE
    WHEN (LENGTH(s.name) + EXTRACT(DAY FROM d.day)::int) % 10 = 3 THEN 'absent'
    WHEN (LENGTH(s.name) + EXTRACT(DAY FROM d.day)::int) % 10 = 7 THEN 'late'
    ELSE 'present'
  END,
  s.class || '-' || s.section
FROM students s
CROSS JOIN (
  SELECT unnest(ARRAY[
    '2026-05-01'::date,'2026-05-04','2026-05-05','2026-05-06',
    '2026-05-07','2026-05-08','2026-05-11','2026-05-12',
    '2026-05-13','2026-05-14','2026-05-15','2026-05-18',
    '2026-05-19','2026-05-20'
  ]) AS day
) AS d
WHERE s.is_active = TRUE
ON CONFLICT (student_id, date) DO NOTHING;

-- April 2026 (22 working days — excludes weekends)
INSERT INTO attendance (student_id, date, status, class)
SELECT
  s.id,
  d.day,
  CASE
    WHEN (LENGTH(s.name) + EXTRACT(DAY FROM d.day)::int) % 8 = 2 THEN 'absent'
    WHEN (LENGTH(s.name) + EXTRACT(DAY FROM d.day)::int) % 8 = 5 THEN 'late'
    ELSE 'present'
  END,
  s.class || '-' || s.section
FROM students s
CROSS JOIN (
  SELECT unnest(ARRAY[
    '2026-04-01'::date,'2026-04-02','2026-04-03','2026-04-06',
    '2026-04-07','2026-04-08','2026-04-09','2026-04-10',
    '2026-04-13','2026-04-14','2026-04-15','2026-04-16',
    '2026-04-17','2026-04-20','2026-04-21','2026-04-22',
    '2026-04-23','2026-04-24','2026-04-27','2026-04-28',
    '2026-04-29','2026-04-30'
  ]) AS day
) AS d
WHERE s.is_active = TRUE
ON CONFLICT (student_id, date) DO NOTHING;

-- ============================================================
-- SEED: FEE PAYMENTS
-- April instalment  → all 15 students PAID
-- May instalment    → roll 01 & 02 each class PAID (10/15), roll 03 PENDING
-- June–September    → all 15 PENDING
-- ============================================================

WITH payment_data AS (
  SELECT
    s.id       AS student_id,
    fs.id      AS fee_structure_id,
    fs.amount  AS amount_due,
    fs.due_date,
    s.class,
    s.section,
    s.roll_no,
    fs.name    AS fee_name,
    CASE
      WHEN fs.name LIKE '%April%'                             THEN 'paid'
      WHEN fs.name LIKE '%May%' AND s.roll_no IN ('01','02') THEN 'paid'
      ELSE 'pending'
    END AS pay_status
  FROM students s
  CROSS JOIN fee_structures fs
  WHERE s.is_active = TRUE
)
INSERT INTO fee_payments
  (student_id, fee_structure_id, amount_due, amount_paid, status, due_date, paid_at, receipt_no)
SELECT
  student_id,
  fee_structure_id,
  amount_due,
  CASE WHEN pay_status = 'paid' THEN amount_due ELSE 0 END,
  pay_status,
  due_date,
  CASE WHEN pay_status = 'paid' THEN
    CASE WHEN fee_name LIKE '%April%'
      THEN '2026-04-05 10:00:00+05:30'::TIMESTAMPTZ
      ELSE '2026-05-08 10:00:00+05:30'::TIMESTAMPTZ
    END
  ELSE NULL END,
  CASE WHEN pay_status = 'paid' THEN
    'RC-SN-' || REPLACE(class, ' ', '') || section || roll_no ||
    '-' || LPAD(EXTRACT(MONTH FROM due_date)::TEXT, 2, '0')
  ELSE NULL END
FROM payment_data
ON CONFLICT (student_id, fee_structure_id) DO NOTHING;
