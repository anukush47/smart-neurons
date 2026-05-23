-- ============================================================
-- Smart Neurons ERP — Syllabus Table (idempotent)
-- ============================================================

CREATE TABLE IF NOT EXISTS syllabus (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class        TEXT NOT NULL,
  section      TEXT NOT NULL DEFAULT 'A',
  subject      TEXT NOT NULL,
  term         TEXT NOT NULL,
  color        TEXT DEFAULT '#6BCB77',
  bg           TEXT DEFAULT 'rgba(107,203,119,0.10)',
  topics       JSONB DEFAULT '[]',
  note         TEXT DEFAULT '',
  file_uploaded BOOLEAN DEFAULT FALSE,
  file_name    TEXT DEFAULT '',
  updated_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.syllabus'::regclass
    AND contype = 'u'
    AND conname = 'syllabus_class_section_subject_term_key'
  ) THEN
    ALTER TABLE syllabus ADD CONSTRAINT syllabus_class_section_subject_term_key
      UNIQUE (class, section, subject, term);
  END IF;
END $$;

ALTER TABLE syllabus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "syllabus_admin_faculty_all" ON syllabus;
CREATE POLICY "syllabus_admin_faculty_all" ON syllabus
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'faculty', 'superadmin')
  );

DROP POLICY IF EXISTS "syllabus_parent_read" ON syllabus;
CREATE POLICY "syllabus_parent_read" ON syllabus
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Seed rows (noop if constraint already exists)
DO $$
DECLARE
  cls TEXT;
  subj TEXT;
  t TEXT;
  subj_color TEXT;
  subj_bg TEXT;
BEGIN
  FOR cls IN SELECT unnest(ARRAY['Nursery','LKG','UKG','JKG','SKG']) LOOP
    FOR t IN SELECT unnest(ARRAY['Term 1','Term 2']) LOOP
      FOR subj, subj_color, subj_bg IN
        SELECT * FROM (VALUES
          ('English',         '#6BCB77', 'rgba(107,203,119,0.10)'),
          ('Hindi',           '#FF6B6B', 'rgba(255,107,107,0.10)'),
          ('Maths',           '#4D96FF', 'rgba(77,150,255,0.10)'),
          ('EVS',             '#FFD93D', 'rgba(255,217,61,0.10)'),
          ('Drawing & Craft', '#FF922B', 'rgba(255,146,43,0.10)'),
          ('Music & Rhymes',  '#CC5DE8', 'rgba(204,93,232,0.10)')
        ) AS v(s, c, b)
      LOOP
        INSERT INTO syllabus (class, section, subject, term, color, bg, topics, note)
        VALUES (cls, 'A', subj, t, subj_color, subj_bg, '[]', '')
        ON CONFLICT (class, section, subject, term) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
