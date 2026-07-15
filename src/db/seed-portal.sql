-- ────────────────────────────────────────────────────────────────────────────
-- seed-portal.sql — dummy data for the client (patient) portal.
--
-- Run AFTER applying the Drizzle migrations (bun run db:migrate), e.g. paste
-- into the Supabase SQL editor or `psql "$DATABASE_URL" -f src/db/seed-portal.sql`.
--
-- Idempotent: fixed UUIDs + ON CONFLICT DO NOTHING, so re-running changes nothing.
-- Edit the values freely — they are only starter rows.
--
-- Log in as the seed patient:
--     email:    patient@mindcarter.com
--     password: Password123!
-- (The two psychologists share the same password; the bcrypt hash below is for
--  "Password123!" at cost 12.)
-- ────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── Users (1 patient + 2 psychologists) ─────────────────────────────────────
INSERT INTO users (id, email, password_hash, role, name, phone, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'patient@mindcarter.com',
   '$2b$12$8pCro.rv8SAdF4ZXj09DcOU6Q.KdN.7kPTbYddPYk2haC5U.Enpji', 'patient',
   'Jordan Blake', '+91 98400 11111', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'aditi.carter@mindcarter.com',
   '$2b$12$8pCro.rv8SAdF4ZXj09DcOU6Q.KdN.7kPTbYddPYk2haC5U.Enpji', 'psychologist',
   'Dr. Aditi Carter', '+91 98400 12345', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'marcus.vale@mindcarter.com',
   '$2b$12$8pCro.rv8SAdF4ZXj09DcOU6Q.KdN.7kPTbYddPYk2haC5U.Enpji', 'psychologist',
   'Dr. Marcus Vale', '+91 98400 67890', 'active')
ON CONFLICT DO NOTHING;

-- ── Patient profile (Profile page fields) ───────────────────────────────────
-- onboarding_complete = true since every required field is already filled in.
INSERT INTO patient_profiles
  (user_id, primary_concern, tags, total_sessions, date_of_birth, address,
   emergency_contact_name, emergency_contact_phone, preferred_language, notification_prefs,
   onboarding_complete) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Anxiety and sleep',
   ARRAY['anxiety','sleep'], 0, '1993-04-15', '12 Wellness Lane, Kochi, Kerala 682001',
   'Priya Nair', '+91 98400 99999', 'English',
   '{"sessionReminders":true,"journalPrompts":true,"careTeamMessages":true,"marketing":false}'::jsonb,
   true)
ON CONFLICT DO NOTHING;

-- ── Psychologist profiles (Care Team cards + booking price) ──────────────────
INSERT INTO psychologist_profiles
  (user_id, title, license_number, specialties, bio, years_experience, rating, price) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Clinical Psychologist', 'PSY-1001',
   ARRAY['CBT','Trauma','Anxiety','Depression'],
   'Specialising in CBT and trauma-informed care with over 12 years of experience working with individuals and organisations across Asia and the UK.',
   12, 4.9, 1000.00),
  ('33333333-3333-3333-3333-333333333333', 'Organizational Psychologist', 'PSY-1002',
   ARRAY['Leadership','Culture','Conflict Resolution'],
   'Executive coach and organisational psychologist focusing on leadership, team culture and workplace behaviour change.',
   8, 4.8, 1200.00)
ON CONFLICT DO NOTHING;

-- ── Care team links (Aditi is primary) ──────────────────────────────────────
INSERT INTO care_team_members (patient_id, psychologist_id, is_primary) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', true),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', false)
ON CONFLICT DO NOTHING;

-- ── Bookings (dates relative to today; upcoming / completed / canceled) ──────
INSERT INTO bookings
  (id, patient_id, psychologist_id, scheduled_date, scheduled_time, duration_minutes,
   session_kind, mode, status, amount, notes) VALUES
  ('b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222', CURRENT_DATE, '10:00:00', 50,
   'individual_therapy', 'video', 'scheduled', 1000.00,
   'Continue working on cognitive restructuring exercises from last session.'),
  ('b0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222', CURRENT_DATE + 7, '10:00:00', 50,
   'individual_therapy', 'video', 'scheduled', 1000.00, NULL),
  ('b0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   '33333333-3333-3333-3333-333333333333', CURRENT_DATE + 14, '14:00:00', 60,
   'executive_coaching', 'in_person', 'scheduled', 1200.00, NULL),
  ('b0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222', CURRENT_DATE - 7, '10:00:00', 50,
   'individual_therapy', 'video', 'completed', 1000.00,
   'Discussed sleep hygiene and introduced body-scan meditation.'),
  ('b0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222', CURRENT_DATE - 14, '10:00:00', 50,
   'individual_therapy', 'video', 'completed', 1000.00, NULL),
  ('b0000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
   '33333333-3333-3333-3333-333333333333', CURRENT_DATE - 21, '15:00:00', 45,
   'executive_coaching', 'phone', 'canceled', 1200.00, NULL)
ON CONFLICT (id) DO NOTHING;

-- ── Diary entries (mood 1–5, tags; today left un-logged for the check-in UX) ─
INSERT INTO diary_entries
  (id, patient_id, author_id, title, status, content, mood, tags, entry_date) VALUES
  ('d0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   '11111111-1111-1111-1111-111111111111', 'Better sleep after the breathing exercises',
   'pending_review',
   'Tried the 4-7-8 breathing technique before bed and slept through the night. Woke up feeling rested.',
   4, ARRAY['sleep','breathing','anxiety'], CURRENT_DATE - 1),
  ('d0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   '11111111-1111-1111-1111-111111111111', 'Rough afternoon but recovered', 'pending_review',
   'Difficult conversation with my manager. Noticed myself catastrophising and used the reframing worksheet.',
   3, ARRAY['work','cbt','thoughts'], CURRENT_DATE - 3),
  ('d0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   '11111111-1111-1111-1111-111111111111', 'Really good day', 'reviewed',
   'No particular reason — just woke up energised. Went for a walk. Small things felt enjoyable again.',
   5, ARRAY['energy','positive'], CURRENT_DATE - 5),
  ('d0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   '11111111-1111-1111-1111-111111111111', 'Low energy, hard to focus', 'pending_review',
   'Struggled to concentrate all day. Nothing catastrophic — just felt flat. Will mention next session.',
   2, ARRAY['low mood','focus'], CURRENT_DATE - 9),
  ('d0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   '11111111-1111-1111-1111-111111111111', 'Post-session reflection', 'reviewed',
   'Session focused on childhood patterns. A lot to process, but something clicked.',
   3, ARRAY['therapy','reflection'], CURRENT_DATE - 12),
  ('d0000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
   '11111111-1111-1111-1111-111111111111', 'Weekend reset', 'pending_review',
   'Spent time outdoors and away from screens. Felt the most present I have in weeks.',
   4, ARRAY['self-care'], CURRENT_DATE - 15)
ON CONFLICT (id) DO NOTHING;

-- ── Notifications ───────────────────────────────────────────────────────────
INSERT INTO notifications
  (id, user_id, kind, title, body, read, action_url, action_params, created_at) VALUES
  ('e0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'meeting',
   'Session today at 10:00 AM', 'Your session with Dr. Aditi Carter starts soon. Join via the Sessions page.',
   false, '/client/sessions', NULL, now() - interval '2 hours'),
  ('e0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'diary',
   'Daily check-in reminder', 'How are you feeling today? Log your mood to keep your streak going.',
   false, '/client/journal', NULL, now() - interval '1 day'),
  ('e0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'message',
   'Message from Dr. Aditi Carter', 'Reminder to complete the thought record sheet before our next session.',
   true, '/client/care-team', NULL, now() - interval '2 days'),
  ('e0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'meeting',
   'Upcoming session in 7 days', 'You have a session booked with Dr. Aditi Carter next week.',
   true, '/client/sessions', NULL, now() - interval '3 days'),
  ('e0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'system',
   'Welcome to Mindcarter', 'Your account is active. Explore your dashboard, sessions and wellness journal.',
   true, NULL, NULL, now() - interval '7 days')
ON CONFLICT (id) DO NOTHING;

COMMIT;
