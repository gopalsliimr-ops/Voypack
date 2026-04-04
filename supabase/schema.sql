-- ═══════════════════════════════════════════════════════════════════════
-- TripSync — Full Schema
-- Paste the entire file into Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════


-- ── 1. PROFILES ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name         TEXT,
  city         TEXT,
  avatar_color TEXT        DEFAULT 'bg-indigo-500',
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- ── 2. TRIPS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.trips (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT        NOT NULL,
  destination    TEXT,
  start_date     DATE,
  end_date       DATE,
  status         TEXT        DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','past','cancelled')),
  stage          INTEGER     DEFAULT 1          CHECK (stage BETWEEN 1 AND 7),
  cover_gradient TEXT        DEFAULT 'from-indigo-500 to-purple-600',
  created_by     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips_insert" ON public.trips FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "trips_update" ON public.trips FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "trips_delete" ON public.trips FOR DELETE USING (created_by = auth.uid());
-- SELECT policy added after trip_members exists (below)


-- ── 3. TRIP MEMBERS ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.trip_members (
  id        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id   UUID        REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id   UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  role      TEXT        DEFAULT 'member' CHECK (role IN ('owner','member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (trip_id, user_id)
);

ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

-- Users can see their own membership rows
CREATE POLICY "trip_members_select"
  ON public.trip_members FOR SELECT
  USING (user_id = auth.uid());

-- Users can add themselves to a trip
CREATE POLICY "trip_members_insert"
  ON public.trip_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Trip owner (via trips.created_by) can manage all members
CREATE POLICY "trip_members_owner_all"
  ON public.trip_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_members.trip_id
        AND trips.created_by = auth.uid()
    )
  );

-- NOW add the trips SELECT policy (references trip_members which now exists)
CREATE POLICY "trips_select"
  ON public.trips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = trips.id AND user_id = auth.uid()
    )
  );


-- ── 4. INVITES ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.invites (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id     UUID        REFERENCES public.trips(id) ON DELETE CASCADE,
  invite_code TEXT        UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_by  UUID        REFERENCES public.profiles(id),
  expires_at  TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_select"  ON public.invites FOR SELECT  USING (true);
CREATE POLICY "invites_insert"  ON public.invites FOR INSERT  WITH CHECK (created_by = auth.uid());
CREATE POLICY "invites_delete"  ON public.invites FOR DELETE  USING (created_by = auth.uid());


-- ── 5. DATE PROPOSALS & VOTES ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.date_proposals (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id      UUID    REFERENCES public.trips(id) ON DELETE CASCADE,
  proposed_by  UUID    REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_date   DATE    NOT NULL,
  end_date     DATE    NOT NULL,
  is_confirmed BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.date_votes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.date_proposals(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote        TEXT NOT NULL CHECK (vote IN ('yes','maybe','no')),
  voted_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (proposal_id, user_id)
);

ALTER TABLE public.date_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_votes     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "date_proposals_select" ON public.date_proposals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = date_proposals.trip_id AND user_id = auth.uid()));
CREATE POLICY "date_proposals_insert" ON public.date_proposals FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = date_proposals.trip_id AND user_id = auth.uid()));
CREATE POLICY "date_proposals_update" ON public.date_proposals FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = date_proposals.trip_id AND user_id = auth.uid() AND role = 'owner'));

CREATE POLICY "date_votes_select" ON public.date_votes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.date_proposals dp JOIN public.trip_members tm ON tm.trip_id = dp.trip_id WHERE dp.id = date_votes.proposal_id AND tm.user_id = auth.uid()));
CREATE POLICY "date_votes_insert" ON public.date_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "date_votes_update" ON public.date_votes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "date_votes_delete" ON public.date_votes FOR DELETE USING (user_id = auth.uid());


-- ── 6. DESTINATION PROPOSALS & VOTES ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.destination_proposals (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id      UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  proposed_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  note         TEXT,
  is_ai        BOOLEAN DEFAULT FALSE,
  is_confirmed BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.destination_votes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.destination_proposals(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote        TEXT NOT NULL CHECK (vote IN ('yes','maybe','no')),
  voted_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (proposal_id, user_id)
);

ALTER TABLE public.destination_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_votes     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dest_proposals_select" ON public.destination_proposals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = destination_proposals.trip_id AND user_id = auth.uid()));
CREATE POLICY "dest_proposals_insert" ON public.destination_proposals FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = destination_proposals.trip_id AND user_id = auth.uid()));
CREATE POLICY "dest_proposals_update" ON public.destination_proposals FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = destination_proposals.trip_id AND user_id = auth.uid() AND role = 'owner'));

CREATE POLICY "dest_votes_select" ON public.destination_votes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.destination_proposals dp JOIN public.trip_members tm ON tm.trip_id = dp.trip_id WHERE dp.id = destination_votes.proposal_id AND tm.user_id = auth.uid()));
CREATE POLICY "dest_votes_insert" ON public.destination_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "dest_votes_update" ON public.destination_votes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "dest_votes_delete" ON public.destination_votes FOR DELETE USING (user_id = auth.uid());


-- ── 7. BUDGET PROPOSALS & VOTES ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.budget_proposals (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id        UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  proposed_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  min_per_person INTEGER NOT NULL,
  max_per_person INTEGER NOT NULL,
  is_confirmed   BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budget_votes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.budget_proposals(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote        TEXT NOT NULL CHECK (vote IN ('yes','maybe','no')),
  voted_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (proposal_id, user_id)
);

ALTER TABLE public.budget_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_votes     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_proposals_select" ON public.budget_proposals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = budget_proposals.trip_id AND user_id = auth.uid()));
CREATE POLICY "budget_proposals_insert" ON public.budget_proposals FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = budget_proposals.trip_id AND user_id = auth.uid()));
CREATE POLICY "budget_proposals_update" ON public.budget_proposals FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = budget_proposals.trip_id AND user_id = auth.uid() AND role = 'owner'));

CREATE POLICY "budget_votes_select" ON public.budget_votes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.budget_proposals bp JOIN public.trip_members tm ON tm.trip_id = bp.trip_id WHERE bp.id = budget_votes.proposal_id AND tm.user_id = auth.uid()));
CREATE POLICY "budget_votes_insert" ON public.budget_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "budget_votes_update" ON public.budget_votes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "budget_votes_delete" ON public.budget_votes FOR DELETE USING (user_id = auth.uid());


-- ── 8. TRIPULSE RESPONSES ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tripulse_responses (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id      UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL CHECK (status IN ('yes','maybe','no','awaiting')),
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (trip_id, user_id)
);

ALTER TABLE public.tripulse_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tripulse_select" ON public.tripulse_responses FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = tripulse_responses.trip_id AND user_id = auth.uid()));
CREATE POLICY "tripulse_insert" ON public.tripulse_responses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tripulse_update" ON public.tripulse_responses FOR UPDATE USING (user_id = auth.uid());


-- ── 9. BUDGET SUBMISSIONS (Anonymous) ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.budget_submissions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id        UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_per_day INTEGER NOT NULL,
  submitted_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (trip_id, user_id)
);

ALTER TABLE public.budget_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_sub_select" ON public.budget_submissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "budget_sub_insert" ON public.budget_submissions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "budget_sub_update" ON public.budget_submissions FOR UPDATE USING (user_id = auth.uid());


-- ── 10. EXPENSES & SPLITS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.expenses (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id    UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  amount     INTEGER NOT NULL,
  paid_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category   TEXT DEFAULT 'other' CHECK (category IN ('food','transport','activities','stay','other')),
  split_mode TEXT DEFAULT 'equal' CHECK (split_mode IN ('equal','exclude','custom','percentage')),
  date       DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expense_splits (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id  UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount      INTEGER,
  percentage  INTEGER,
  is_included BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.expenses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select" ON public.expenses FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid()));
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT
  WITH CHECK (paid_by = auth.uid() AND EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid()));
CREATE POLICY "expenses_update" ON public.expenses FOR UPDATE USING (paid_by = auth.uid());
CREATE POLICY "expenses_delete" ON public.expenses FOR DELETE USING (paid_by = auth.uid());

CREATE POLICY "splits_select" ON public.expense_splits FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.expenses e JOIN public.trip_members tm ON tm.trip_id = e.trip_id WHERE e.id = expense_splits.expense_id AND tm.user_id = auth.uid()));
CREATE POLICY "splits_all" ON public.expense_splits FOR ALL
  USING (EXISTS (SELECT 1 FROM public.expenses WHERE id = expense_splits.expense_id AND paid_by = auth.uid()));


-- ── 11. TRIPBOND PAYMENTS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tripbond_payments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id    UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  paid       BOOLEAN DEFAULT FALSE,
  paid_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (trip_id, user_id)
);

ALTER TABLE public.tripbond_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tripbond_select" ON public.tripbond_payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = tripbond_payments.trip_id AND user_id = auth.uid()));
CREATE POLICY "tripbond_update" ON public.tripbond_payments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "tripbond_owner_all" ON public.tripbond_payments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = tripbond_payments.trip_id AND user_id = auth.uid() AND role = 'owner'));


-- ── 12. INDEXES ───────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_trip_members_trip_id  ON public.trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user_id  ON public.trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id      ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_date_proposals_trip   ON public.date_proposals(trip_id);
CREATE INDEX IF NOT EXISTS idx_dest_proposals_trip   ON public.destination_proposals(trip_id);
CREATE INDEX IF NOT EXISTS idx_budget_proposals_trip ON public.budget_proposals(trip_id);
CREATE INDEX IF NOT EXISTS idx_tripulse_trip         ON public.tripulse_responses(trip_id);
CREATE INDEX IF NOT EXISTS idx_invites_code          ON public.invites(invite_code);


-- ── 13. STORAGE POLICIES (avatars bucket) ────────────────────────────────
-- First create the bucket: Dashboard → Storage → New bucket → name: avatars, Public: ON
-- Then run these three lines:

CREATE POLICY "avatars_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
