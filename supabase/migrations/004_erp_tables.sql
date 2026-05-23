-- ============================================================
-- Smart Neurons ERP — Phase 2 Tables
-- staff_profiles, timetable, announcements, leave_applications,
-- gallery, school_settings, messages
-- ============================================================

-- ── staff_profiles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  designation   TEXT,
  phone         TEXT,
  join_date     DATE,
  casual_balance INT DEFAULT 12,
  sick_balance  INT DEFAULT 7,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_profiles_admin_all" ON staff_profiles;
CREATE POLICY "staff_profiles_admin_all" ON staff_profiles
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin','superadmin')
  );

DROP POLICY IF EXISTS "staff_profiles_self_read" ON staff_profiles;
CREATE POLICY "staff_profiles_self_read" ON staff_profiles
  FOR SELECT USING (id = auth.uid());

-- ── timetable ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timetable (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class       TEXT NOT NULL,
  section     TEXT NOT NULL,
  day         TEXT NOT NULL,
  periods     JSONB NOT NULL DEFAULT '[]',
  updated_by  UUID REFERENCES auth.users(id),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class, section, day)
);

ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "timetable_admin_all" ON timetable;
CREATE POLICY "timetable_admin_all" ON timetable
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin','superadmin')
  );

DROP POLICY IF EXISTS "timetable_read_all_auth" ON timetable;
CREATE POLICY "timetable_read_all_auth" ON timetable
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ── announcements ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  tag           TEXT DEFAULT 'General',
  audience      TEXT DEFAULT 'All',
  class_filter  TEXT,
  sent_by       UUID REFERENCES auth.users(id),
  sent_by_name  TEXT,
  pinned        BOOLEAN DEFAULT FALSE,
  status        TEXT DEFAULT 'sent',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_admin_all" ON announcements;
CREATE POLICY "announcements_admin_all" ON announcements
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin','superadmin')
  );

DROP POLICY IF EXISTS "announcements_read_auth" ON announcements;
CREATE POLICY "announcements_read_auth" ON announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ── leave_applications ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id    UUID NOT NULL REFERENCES auth.users(id),
  faculty_name  TEXT,
  from_date     DATE NOT NULL,
  to_date       DATE NOT NULL,
  days          INT NOT NULL,
  type          TEXT NOT NULL,
  reason        TEXT,
  status        TEXT DEFAULT 'pending',
  admin_note    TEXT,
  applied_at    TIMESTAMPTZ DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ
);

ALTER TABLE leave_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leave_admin_all" ON leave_applications;
CREATE POLICY "leave_admin_all" ON leave_applications
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin','superadmin')
  );

DROP POLICY IF EXISTS "leave_faculty_own" ON leave_applications;
CREATE POLICY "leave_faculty_own" ON leave_applications
  USING (faculty_id = auth.uid());

-- ── gallery ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  image_url        TEXT NOT NULL,
  class_filter     TEXT,
  uploaded_by      UUID REFERENCES auth.users(id),
  uploaded_by_name TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_admin_faculty_write" ON gallery;
CREATE POLICY "gallery_admin_faculty_write" ON gallery
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin','faculty','superadmin')
  );

DROP POLICY IF EXISTS "gallery_read_auth" ON gallery;
CREATE POLICY "gallery_read_auth" ON gallery
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ── school_settings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_settings (
  id            INT PRIMARY KEY DEFAULT 1,
  school_name   TEXT DEFAULT 'Smart Neurons',
  tagline       TEXT DEFAULT 'Where Little Minds Bloom',
  address       TEXT DEFAULT 'Bhopal, Madhya Pradesh',
  phone         TEXT DEFAULT '+91 98765 43210',
  email         TEXT DEFAULT 'info@smartneurons.in',
  academic_year TEXT DEFAULT '2025-26',
  logo_url      TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_admin_all" ON school_settings;
CREATE POLICY "settings_admin_all" ON school_settings
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin','superadmin')
  );

DROP POLICY IF EXISTS "settings_read_auth" ON school_settings;
CREATE POLICY "settings_read_auth" ON school_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

INSERT INTO school_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ── messages ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id  UUID NOT NULL REFERENCES auth.users(id),
  from_name     TEXT,
  from_role     TEXT,
  to_user_id    UUID NOT NULL REFERENCES auth.users(id),
  body          TEXT NOT NULL,
  sent_at       TIMESTAMPTZ DEFAULT NOW(),
  read          BOOLEAN DEFAULT FALSE
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_own" ON messages;
CREATE POLICY "messages_own" ON messages
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- ── progress_reports (if not already created) ───────────────
CREATE TABLE IF NOT EXISTS progress_reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term           TEXT NOT NULL,
  subjects       JSONB DEFAULT '[]',
  conduct        TEXT,
  teacher_remark TEXT,
  promoted       BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, term)
);

ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_admin_faculty_all" ON progress_reports;
CREATE POLICY "reports_admin_faculty_all" ON progress_reports
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin','faculty','superadmin')
  );

DROP POLICY IF EXISTS "reports_parent_read_own" ON progress_reports;
CREATE POLICY "reports_parent_read_own" ON progress_reports
  FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE parent_user_id = auth.uid()
    )
  );
