-- ============================================================
-- Smart Neurons ERP — Homework + Syllabus tables + seed data
-- ============================================================

-- TABLES

CREATE TABLE IF NOT EXISTS homework (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class        TEXT NOT NULL,
  section      TEXT NOT NULL DEFAULT 'A',
  subject      TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  type         TEXT NOT NULL CHECK (type IN ('Drawing','Activity','Oral','Written','Reading')),
  due_date     DATE NOT NULL,
  assigned_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  academic_year TEXT DEFAULT '2026-27',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homework_submissions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  homework_id  UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','reviewed')),
  submitted_at TIMESTAMPTZ,
  remarks      TEXT,
  UNIQUE(homework_id, student_id)
);

CREATE TABLE IF NOT EXISTS syllabus (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class         TEXT NOT NULL,
  section       TEXT NOT NULL DEFAULT 'A',
  subject       TEXT NOT NULL,
  term          TEXT NOT NULL CHECK (term IN ('Term 1','Term 2')),
  academic_year TEXT DEFAULT '2026-27',
  color         TEXT DEFAULT '#6BCB77',
  bg            TEXT DEFAULT 'rgba(107,203,119,0.10)',
  topics        JSONB NOT NULL DEFAULT '[]',
  note          TEXT DEFAULT '',
  file_name     TEXT DEFAULT '',
  file_uploaded BOOLEAN DEFAULT FALSE,
  updated_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class, section, subject, term, academic_year)
);

-- RLS

ALTER TABLE homework             ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus             ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_all_homework"      ON homework             FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_hw_subs"       ON homework_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_syllabus"      ON syllabus             FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: HOMEWORK — 10 records (2 per class), submissions auto-generated
-- Past due → deterministic mixed statuses; future due → all pending
-- ============================================================

WITH hw AS (
  INSERT INTO homework (class, section, subject, title, description, type, due_date, academic_year)
  VALUES
    ('Nursery','A','Art',    'Draw your pet animal',         'Draw your favourite pet using crayons and write its name below.',      'Drawing', '2026-05-15','2026-27'),
    ('Nursery','A','English','Recite Twinkle Twinkle',       'Practise "Twinkle Twinkle Little Star" with actions. Parents listen.', 'Oral',    '2026-05-28','2026-27'),
    ('LKG',    'A','English','Trace capital letters A–E',    'Trace dotted capital letters A, B, C, D, E in your workbook pg 12.',   'Written', '2026-05-16','2026-27'),
    ('LKG',    'A','English','Read page 5 aloud',            'Read the short story on page 5 to a parent. Parents record if able.',  'Reading', '2026-05-26','2026-27'),
    ('UKG',    'A','Maths',  'Count objects at home',        'Count 5 groups of objects at home and write the numbers.',            'Activity','2026-05-18','2026-27'),
    ('UKG',    'A','Maths',  'Write numbers 1–20',           'Write numbers 1 to 20 in your notebook using neat handwriting.',      'Written', '2026-05-27','2026-27'),
    ('JKG',    'A','Art',    'Draw your favourite fruit',    'Draw and colour your favourite fruit. Label it in English & Hindi.',   'Drawing', '2026-05-19','2026-27'),
    ('JKG',    'A','Hindi',  'Revise Hindi vowels',          'Practise writing and saying vowels अ, आ, इ, ई with your parents.',   'Oral',    '2026-05-25','2026-27'),
    ('SKG',    'A','English','Write 5 sentences',            'Write 5 simple sentences about your family in your notebook.',       'Written', '2026-05-20','2026-27'),
    ('SKG',    'A','Maths',  'Solve addition sums',          'Solve the 10 addition sums on page 20 of your workbook.',            'Written', '2026-05-29','2026-27')
  RETURNING id, class, section, due_date
)
INSERT INTO homework_submissions (homework_id, student_id, status, submitted_at, remarks)
SELECT
  h.id,
  s.id,
  CASE
    WHEN h.due_date >= CURRENT_DATE THEN 'pending'
    WHEN (LENGTH(s.name) + EXTRACT(DAY FROM h.due_date)::int) % 3 = 0 THEN 'reviewed'
    WHEN (LENGTH(s.name) + EXTRACT(DAY FROM h.due_date)::int) % 3 = 1 THEN 'submitted'
    ELSE 'pending'
  END,
  CASE
    WHEN h.due_date < CURRENT_DATE
      AND (LENGTH(s.name) + EXTRACT(DAY FROM h.due_date)::int) % 3 != 2
    THEN (h.due_date - INTERVAL '1 day')::TIMESTAMPTZ
    ELSE NULL
  END,
  CASE
    WHEN h.due_date < CURRENT_DATE
      AND (LENGTH(s.name) + EXTRACT(DAY FROM h.due_date)::int) % 3 = 0
    THEN 'Well done! Keep it up.'
    ELSE NULL
  END
FROM hw h
JOIN students s ON s.class = h.class AND s.section = h.section AND s.is_active = TRUE
ON CONFLICT (homework_id, student_id) DO NOTHING;

-- ============================================================
-- SEED: SYLLABUS — 27 records across 5 classes × subjects × Term 1
-- ============================================================

INSERT INTO syllabus (class, section, subject, term, academic_year, color, bg, topics, note)
VALUES

-- ── Nursery-A (4 subjects) ─────────────────────────────────

('Nursery','A','English','Term 1','2026-27','#d97706','rgba(217,119,6,0.10)',
'[{"id":"n-en-1","title":"Alphabet Recognition (A–Z)","done":true,"week":"Week 1–2"},
  {"id":"n-en-2","title":"Letter Sounds (Phonics)","done":true,"week":"Week 3–4"},
  {"id":"n-en-3","title":"Simple Words (CVC)","done":false,"week":"Week 5–6"},
  {"id":"n-en-4","title":"Basic Sentences","done":false,"week":"Week 7–8"},
  {"id":"n-en-5","title":"Picture Reading","done":false,"week":"Week 9–10"}]'::jsonb,
'Revise the alphabet daily with flashcards.'),

('Nursery','A','Hindi','Term 1','2026-27','#7c3aed','rgba(124,58,237,0.10)',
'[{"id":"n-hi-1","title":"Swar — अ to अः","done":true,"week":"Week 1–2"},
  {"id":"n-hi-2","title":"Vyanjan Part 1 (क–ञ)","done":true,"week":"Week 3–4"},
  {"id":"n-hi-3","title":"Vyanjan Part 2 (ट–न)","done":false,"week":"Week 5–6"},
  {"id":"n-hi-4","title":"Simple Hindi Words","done":false,"week":"Week 7–8"}]'::jsonb,
'Practise swar daily. Use the chart provided.'),

('Nursery','A','Mathematics','Term 1','2026-27','#6BCB77','rgba(107,203,119,0.10)',
'[{"id":"n-ma-1","title":"Numbers 1–10 (Recognition)","done":true,"week":"Week 1–2"},
  {"id":"n-ma-2","title":"Counting Objects","done":true,"week":"Week 3–4"},
  {"id":"n-ma-3","title":"Numbers 11–20","done":false,"week":"Week 5–6"},
  {"id":"n-ma-4","title":"Before & After","done":false,"week":"Week 7–8"},
  {"id":"n-ma-5","title":"Shapes (Circle, Square, Triangle)","done":false,"week":"Week 9–10"}]'::jsonb,
'Use everyday objects for counting practice.'),

('Nursery','A','Art & Craft','Term 1','2026-27','#d97706','rgba(255,217,61,0.15)',
'[{"id":"n-ar-1","title":"Colouring within Lines","done":true,"week":"Week 1–2"},
  {"id":"n-ar-2","title":"Free Drawing","done":true,"week":"Week 3–4"},
  {"id":"n-ar-3","title":"Clay Modelling","done":false,"week":"Week 5–6"},
  {"id":"n-ar-4","title":"Paper Folding (Basic)","done":false,"week":"Week 7–8"}]'::jsonb,
'Keep crayons and clay kit at school.'),

-- ── LKG-A (5 subjects) ────────────────────────────────────

('LKG','A','English','Term 1','2026-27','#d97706','rgba(217,119,6,0.10)',
'[{"id":"l-en-1","title":"Capital Letters Writing","done":true,"week":"Week 1–2"},
  {"id":"l-en-2","title":"Small Letters Writing","done":true,"week":"Week 3–4"},
  {"id":"l-en-3","title":"CVC Words","done":true,"week":"Week 5–6"},
  {"id":"l-en-4","title":"Short Sentences","done":false,"week":"Week 7–8"},
  {"id":"l-en-5","title":"Reading Simple Stories","done":false,"week":"Week 9–10"}]'::jsonb,
'Focus on letter formation — pencil grip is key at this stage.'),

('LKG','A','Hindi','Term 1','2026-27','#7c3aed','rgba(124,58,237,0.10)',
'[{"id":"l-hi-1","title":"Swar (Vowels)","done":true,"week":"Week 1–2"},
  {"id":"l-hi-2","title":"Vyanjan Writing (क–म)","done":true,"week":"Week 3–4"},
  {"id":"l-hi-3","title":"Vyanjan Writing (य–ज्ञ)","done":false,"week":"Week 5–6"},
  {"id":"l-hi-4","title":"Matras — aa, i, ii","done":false,"week":"Week 7–8"},
  {"id":"l-hi-5","title":"Simple Hindi Words","done":false,"week":"Week 9–10"}]'::jsonb,
'Use the hindi writing book provided.'),

('LKG','A','Mathematics','Term 1','2026-27','#6BCB77','rgba(107,203,119,0.10)',
'[{"id":"l-ma-1","title":"Numbers 1–20 (Recognition)","done":true,"week":"Week 1–2"},
  {"id":"l-ma-2","title":"Writing Numbers 1–20","done":true,"week":"Week 3–4"},
  {"id":"l-ma-3","title":"Counting & Matching","done":true,"week":"Week 5–6"},
  {"id":"l-ma-4","title":"Addition (1–5)","done":false,"week":"Week 7–8"},
  {"id":"l-ma-5","title":"Subtraction (1–5)","done":false,"week":"Week 9–10"}]'::jsonb,
'Practice number writing daily for muscle memory.'),

('LKG','A','EVS','Term 1','2026-27','#FF6B6B','rgba(255,107,107,0.10)',
'[{"id":"l-ev-1","title":"My Body Parts","done":true,"week":"Week 1–2"},
  {"id":"l-ev-2","title":"My Family","done":true,"week":"Week 3–4"},
  {"id":"l-ev-3","title":"Animals & Their Sounds","done":false,"week":"Week 5–6"},
  {"id":"l-ev-4","title":"Plants & Trees","done":false,"week":"Week 7–8"},
  {"id":"l-ev-5","title":"Food We Eat","done":false,"week":"Week 9–10"}]'::jsonb,
'Encourage observation outdoors during EVS topics.'),

('LKG','A','Art & Craft','Term 1','2026-27','#d97706','rgba(255,217,61,0.15)',
'[{"id":"l-ar-1","title":"Colouring within Lines","done":true,"week":"Week 1–2"},
  {"id":"l-ar-2","title":"Drawing Animals","done":true,"week":"Week 3–4"},
  {"id":"l-ar-3","title":"Paper Cutting (Straight Lines)","done":false,"week":"Week 5–6"},
  {"id":"l-ar-4","title":"Collage Making","done":false,"week":"Week 7–8"},
  {"id":"l-ar-5","title":"Clay Animals","done":false,"week":"Week 9–10"}]'::jsonb,
'Safety scissors only. Supervised activity.'),

-- ── UKG-A (6 subjects) ────────────────────────────────────

('UKG','A','English','Term 1','2026-27','#d97706','rgba(217,119,6,0.10)',
'[{"id":"u-en-1","title":"Sight Words (Set 1)","done":true,"week":"Week 1–2"},
  {"id":"u-en-2","title":"Sight Words (Set 2)","done":true,"week":"Week 3–4"},
  {"id":"u-en-3","title":"Writing Simple Sentences","done":true,"week":"Week 5–6"},
  {"id":"u-en-4","title":"Reading Comprehension (Short)","done":false,"week":"Week 7–8"},
  {"id":"u-en-5","title":"Creative Drawing & Labelling","done":false,"week":"Week 9–10"}]'::jsonb,
'Read aloud together for 10 minutes daily.'),

('UKG','A','Hindi','Term 1','2026-27','#7c3aed','rgba(124,58,237,0.10)',
'[{"id":"u-hi-1","title":"Matras (aa, i, ii, u, uu)","done":true,"week":"Week 1–2"},
  {"id":"u-hi-2","title":"Matras (e, ai, o, au)","done":true,"week":"Week 3–4"},
  {"id":"u-hi-3","title":"Two-letter Words","done":true,"week":"Week 5–6"},
  {"id":"u-hi-4","title":"Three-letter Words","done":false,"week":"Week 7–8"},
  {"id":"u-hi-5","title":"Simple Sentences","done":false,"week":"Week 9–10"}]'::jsonb,
'Matra practice should be done in the printed booklet.'),

('UKG','A','Mathematics','Term 1','2026-27','#6BCB77','rgba(107,203,119,0.10)',
'[{"id":"u-ma-1","title":"Numbers 1–50","done":true,"week":"Week 1–2"},
  {"id":"u-ma-2","title":"Addition (1–10)","done":true,"week":"Week 3–4"},
  {"id":"u-ma-3","title":"Subtraction (1–10)","done":true,"week":"Week 5–6"},
  {"id":"u-ma-4","title":"Shapes & Patterns","done":false,"week":"Week 7–8"},
  {"id":"u-ma-5","title":"Word Problems (Simple)","done":false,"week":"Week 9–10"}]'::jsonb,
'Use number charts at home for addition practice.'),

('UKG','A','EVS','Term 1','2026-27','#FF6B6B','rgba(255,107,107,0.10)',
'[{"id":"u-ev-1","title":"My Neighbourhood","done":true,"week":"Week 1–2"},
  {"id":"u-ev-2","title":"Means of Transport","done":true,"week":"Week 3–4"},
  {"id":"u-ev-3","title":"Seasons & Weather","done":false,"week":"Week 5–6"},
  {"id":"u-ev-4","title":"Water & Air","done":false,"week":"Week 7–8"},
  {"id":"u-ev-5","title":"Cleanliness & Health","done":false,"week":"Week 9–10"}]'::jsonb,
'Relate EVS topics to things the child sees daily.'),

('UKG','A','Art & Craft','Term 1','2026-27','#d97706','rgba(255,217,61,0.15)',
'[{"id":"u-ar-1","title":"Landscape Drawing","done":true,"week":"Week 1–2"},
  {"id":"u-ar-2","title":"Watercolour Basics","done":true,"week":"Week 3–4"},
  {"id":"u-ar-3","title":"Paper Weaving","done":false,"week":"Week 5–6"},
  {"id":"u-ar-4","title":"Nature Collage","done":false,"week":"Week 7–8"},
  {"id":"u-ar-5","title":"Greeting Card Making","done":false,"week":"Week 9–10"}]'::jsonb,
'Bring watercolour paints from next week.'),

('UKG','A','GK & Rhymes','Term 1','2026-27','#1A1A2E','rgba(26,26,46,0.08)',
'[{"id":"u-gk-1","title":"Days of the Week","done":true,"week":"Week 1–2"},
  {"id":"u-gk-2","title":"Months of the Year","done":true,"week":"Week 3–4"},
  {"id":"u-gk-3","title":"National Symbols","done":false,"week":"Week 5–6"},
  {"id":"u-gk-4","title":"Famous Personalities","done":false,"week":"Week 7–8"},
  {"id":"u-gk-5","title":"Current Events (Age-appropriate)","done":false,"week":"Week 9–10"}]'::jsonb,
'Discuss general knowledge over dinner.'),

-- ── JKG-A (6 subjects) ────────────────────────────────────

('JKG','A','English','Term 1','2026-27','#d97706','rgba(217,119,6,0.10)',
'[{"id":"j-en-1","title":"Reading Level 1 (Sentences)","done":true,"week":"Week 1–2"},
  {"id":"j-en-2","title":"Reading Level 2 (Short Para)","done":true,"week":"Week 3–4"},
  {"id":"j-en-3","title":"Writing Sentences (5–6 words)","done":true,"week":"Week 5–6"},
  {"id":"j-en-4","title":"Paragraph Writing","done":false,"week":"Week 7–8"},
  {"id":"j-en-5","title":"Story Reading & Questions","done":false,"week":"Week 9–10"}]'::jsonb,
'Encourage daily 15-minute independent reading.'),

('JKG','A','Hindi','Term 1','2026-27','#7c3aed','rgba(124,58,237,0.10)',
'[{"id":"j-hi-1","title":"All Matras Revision","done":true,"week":"Week 1–2"},
  {"id":"j-hi-2","title":"Reading Hindi Sentences","done":true,"week":"Week 3–4"},
  {"id":"j-hi-3","title":"Writing Hindi Sentences","done":true,"week":"Week 5–6"},
  {"id":"j-hi-4","title":"Short Paragraph Writing","done":false,"week":"Week 7–8"},
  {"id":"j-hi-5","title":"Hindi Story Reading","done":false,"week":"Week 9–10"}]'::jsonb,
'Revise all matras before moving to sentences.'),

('JKG','A','Mathematics','Term 1','2026-27','#6BCB77','rgba(107,203,119,0.10)',
'[{"id":"j-ma-1","title":"Numbers 1–100","done":true,"week":"Week 1–2"},
  {"id":"j-ma-2","title":"Addition (2-digit)","done":true,"week":"Week 3–4"},
  {"id":"j-ma-3","title":"Subtraction (2-digit)","done":true,"week":"Week 5–6"},
  {"id":"j-ma-4","title":"Multiplication (Tables 2–5)","done":false,"week":"Week 7–8"},
  {"id":"j-ma-5","title":"Word Problems","done":false,"week":"Week 9–10"}]'::jsonb,
'Practice multiplication tables 2 and 3 daily.'),

('JKG','A','EVS','Term 1','2026-27','#FF6B6B','rgba(255,107,107,0.10)',
'[{"id":"j-ev-1","title":"Human Body Systems (Basic)","done":true,"week":"Week 1–2"},
  {"id":"j-ev-2","title":"Plants & Their Uses","done":true,"week":"Week 3–4"},
  {"id":"j-ev-3","title":"Animals & Habitats","done":false,"week":"Week 5–6"},
  {"id":"j-ev-4","title":"Soil & Rocks","done":false,"week":"Week 7–8"},
  {"id":"j-ev-5","title":"Conservation & Environment","done":false,"week":"Week 9–10"}]'::jsonb,
'Visit the school garden during EVS plants topic.'),

('JKG','A','Art & Craft','Term 1','2026-27','#d97706','rgba(255,217,61,0.15)',
'[{"id":"j-ar-1","title":"Perspective Drawing (Basic)","done":true,"week":"Week 1–2"},
  {"id":"j-ar-2","title":"Portrait Drawing","done":true,"week":"Week 3–4"},
  {"id":"j-ar-3","title":"Still Life (Objects)","done":false,"week":"Week 5–6"},
  {"id":"j-ar-4","title":"Mosaic Art","done":false,"week":"Week 7–8"},
  {"id":"j-ar-5","title":"Festive Craft","done":false,"week":"Week 9–10"}]'::jsonb,
'Store all art materials in the craft box.'),

('JKG','A','GK & Rhymes','Term 1','2026-27','#1A1A2E','rgba(26,26,46,0.08)',
'[{"id":"j-gk-1","title":"India — States & Capitals (10)","done":true,"week":"Week 1–2"},
  {"id":"j-gk-2","title":"World Countries & Capitals","done":true,"week":"Week 3–4"},
  {"id":"j-gk-3","title":"Science Facts (Space)","done":false,"week":"Week 5–6"},
  {"id":"j-gk-4","title":"Famous Inventions","done":false,"week":"Week 7–8"},
  {"id":"j-gk-5","title":"Current Affairs Digest","done":false,"week":"Week 9–10"}]'::jsonb,
'Read one GK fact together every day.'),

-- ── SKG-A (6 subjects) ────────────────────────────────────

('SKG','A','English','Term 1','2026-27','#d97706','rgba(217,119,6,0.10)',
'[{"id":"s-en-1","title":"Grammar — Nouns & Pronouns","done":true,"week":"Week 1–2"},
  {"id":"s-en-2","title":"Grammar — Verbs & Adjectives","done":true,"week":"Week 3–4"},
  {"id":"s-en-3","title":"Sentence Structure","done":true,"week":"Week 5–6"},
  {"id":"s-en-4","title":"Paragraph Writing","done":false,"week":"Week 7–8"},
  {"id":"s-en-5","title":"Creative Writing (Short Story)","done":false,"week":"Week 9–10"}]'::jsonb,
'Focus on vocabulary building — 5 new words per week.'),

('SKG','A','Hindi','Term 1','2026-27','#7c3aed','rgba(124,58,237,0.10)',
'[{"id":"s-hi-1","title":"Vyakaran — Sangya & Sarvnam","done":true,"week":"Week 1–2"},
  {"id":"s-hi-2","title":"Visheshan & Kriya","done":true,"week":"Week 3–4"},
  {"id":"s-hi-3","title":"Paragraph Writing","done":true,"week":"Week 5–6"},
  {"id":"s-hi-4","title":"Letter Writing (Basic)","done":false,"week":"Week 7–8"},
  {"id":"s-hi-5","title":"Story Reading & Summary","done":false,"week":"Week 9–10"}]'::jsonb,
'Hindi newspaper reading at home (3 headlines daily).'),

('SKG','A','Mathematics','Term 1','2026-27','#6BCB77','rgba(107,203,119,0.10)',
'[{"id":"s-ma-1","title":"Numbers 1–1000","done":true,"week":"Week 1–2"},
  {"id":"s-ma-2","title":"Addition (3-digit)","done":true,"week":"Week 3–4"},
  {"id":"s-ma-3","title":"Subtraction (3-digit)","done":true,"week":"Week 5–6"},
  {"id":"s-ma-4","title":"Multiplication (Tables 2–10)","done":false,"week":"Week 7–8"},
  {"id":"s-ma-5","title":"Division (Basic)","done":false,"week":"Week 9–10"}]'::jsonb,
'Tables 2–10 must be memorised by end of Term 1.'),

('SKG','A','EVS','Term 1','2026-27','#FF6B6B','rgba(255,107,107,0.10)',
'[{"id":"s-ev-1","title":"Natural Disasters","done":true,"week":"Week 1–2"},
  {"id":"s-ev-2","title":"Renewable Energy","done":true,"week":"Week 3–4"},
  {"id":"s-ev-3","title":"Food Chain","done":true,"week":"Week 5–6"},
  {"id":"s-ev-4","title":"Pollution & Solutions","done":false,"week":"Week 7–8"},
  {"id":"s-ev-5","title":"Biodiversity","done":false,"week":"Week 9–10"}]'::jsonb,
'Science experiment planned for Week 5 — bring materials list.'),

('SKG','A','Art & Craft','Term 1','2026-27','#d97706','rgba(255,217,61,0.15)',
'[{"id":"s-ar-1","title":"Pencil Shading Techniques","done":true,"week":"Week 1–2"},
  {"id":"s-ar-2","title":"Poster Making","done":true,"week":"Week 3–4"},
  {"id":"s-ar-3","title":"Best from Waste","done":true,"week":"Week 5–6"},
  {"id":"s-ar-4","title":"Fabric Painting","done":false,"week":"Week 7–8"},
  {"id":"s-ar-5","title":"3D Model Building","done":false,"week":"Week 9–10"}]'::jsonb,
'Fabric for painting activity will be provided.'),

('SKG','A','GK & Rhymes','Term 1','2026-27','#1A1A2E','rgba(26,26,46,0.08)',
'[{"id":"s-gk-1","title":"India — Constitution & Rights","done":true,"week":"Week 1–2"},
  {"id":"s-gk-2","title":"Science & Technology","done":true,"week":"Week 3–4"},
  {"id":"s-gk-3","title":"World Geography","done":true,"week":"Week 5–6"},
  {"id":"s-gk-4","title":"Indian History (Key Events)","done":false,"week":"Week 7–8"},
  {"id":"s-gk-5","title":"Current Affairs Presentation","done":false,"week":"Week 9–10"}]'::jsonb,
'Each student to present 1 current event per week.')

ON CONFLICT (class, section, subject, term, academic_year) DO NOTHING;
