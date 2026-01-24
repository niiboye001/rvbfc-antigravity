-- RvbFC Antigravity Database Integrity & Security Script
-- Run this in the Supabase SQL Editor to enforce data consistency.

-- 1. DROP EXISTING CONSTRAINTS (To avoid errors when re-applying)
-- We attempt to drop standard foreign keys. Names might vary if auto-generated, 
-- but we'll try standard naming conventions or just overwrite with new ones.
ALTER TABLE IF EXISTS public.players DROP CONSTRAINT IF EXISTS players_team_id_fkey;
ALTER TABLE IF EXISTS public.teams DROP CONSTRAINT IF EXISTS teams_season_id_fkey;
ALTER TABLE IF EXISTS public.matches DROP CONSTRAINT IF EXISTS matches_season_id_fkey;
ALTER TABLE IF EXISTS public.matches DROP CONSTRAINT IF EXISTS matches_home_team_id_fkey;
ALTER TABLE IF EXISTS public.matches DROP CONSTRAINT IF EXISTS matches_away_team_id_fkey;
ALTER TABLE IF EXISTS public.match_events DROP CONSTRAINT IF EXISTS match_events_match_id_fkey;
ALTER TABLE IF EXISTS public.match_events DROP CONSTRAINT IF EXISTS match_events_player_id_fkey;
ALTER TABLE IF EXISTS public.match_events DROP CONSTRAINT IF EXISTS match_events_team_id_fkey;

-- 2. APPLY CASCADE DELETION
-- This ensures that deleting a parent record (e.g., Season) automatically deletes children (Matches, Teams).

-- Players -> Team
ALTER TABLE public.players
ADD CONSTRAINT players_team_id_fkey
FOREIGN KEY (team_id)
REFERENCES public.teams (id)
ON DELETE CASCADE;

-- Teams -> Season
ALTER TABLE public.teams
ADD CONSTRAINT teams_season_id_fkey
FOREIGN KEY (season_id)
REFERENCES public.seasons (id)
ON DELETE CASCADE;

-- Matches -> Season
ALTER TABLE public.matches
ADD CONSTRAINT matches_season_id_fkey
FOREIGN KEY (season_id)
REFERENCES public.seasons (id)
ON DELETE CASCADE;

-- Matches -> Home Team
ALTER TABLE public.matches
ADD CONSTRAINT matches_home_team_id_fkey
FOREIGN KEY (home_team_id)
REFERENCES public.teams (id)
ON DELETE CASCADE;

-- Matches -> Away Team
ALTER TABLE public.matches
ADD CONSTRAINT matches_away_team_id_fkey
FOREIGN KEY (away_team_id)
REFERENCES public.teams (id)
ON DELETE CASCADE;

-- Match Events -> Match
ALTER TABLE public.match_events
ADD CONSTRAINT match_events_match_id_fkey
FOREIGN KEY (match_id)
REFERENCES public.matches (id)
ON DELETE CASCADE;

-- Match Events -> Player (Optional: if player is deleted, event stays? Usually better to delete)
ALTER TABLE public.match_events
ADD CONSTRAINT match_events_player_id_fkey
FOREIGN KEY (player_id)
REFERENCES public.players (id)
ON DELETE CASCADE;

-- Match Events -> Team
ALTER TABLE public.match_events
ADD CONSTRAINT match_events_team_id_fkey
FOREIGN KEY (team_id)
REFERENCES public.teams (id)
ON DELETE CASCADE;


-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- Protect tables so only authenticated users (or anon if allowed) can access.

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES (Simple Open Access for Demo/MVP)
-- NOTE: In a production app with Auth, you would restrict INSERT/UPDATE/DELETE to authenticated users.
-- For now, we allow public read/write to ensure the app works out-of-the-box.
-- If you have Auth set up, change 'TO anon' to 'TO authenticated'.

-- Policy: Allow Public Read/Write on SEASONS
DROP POLICY IF EXISTS "Public Policy Seasons" ON public.seasons;
CREATE POLICY "Public Policy Seasons" ON public.seasons FOR ALL USING (true) WITH CHECK (true);

-- Policy: Allow Public Read/Write on TEAMS
DROP POLICY IF EXISTS "Public Policy Teams" ON public.teams;
CREATE POLICY "Public Policy Teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);

-- Policy: Allow Public Read/Write on PLAYERS
DROP POLICY IF EXISTS "Public Policy Players" ON public.players;
CREATE POLICY "Public Policy Players" ON public.players FOR ALL USING (true) WITH CHECK (true);

-- Policy: Allow Public Read/Write on MATCHES
DROP POLICY IF EXISTS "Public Policy Matches" ON public.matches;
CREATE POLICY "Public Policy Matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);

-- Policy: Allow Public Read/Write on MATCH_EVENTS
DROP POLICY IF EXISTS "Public Policy Match Events" ON public.match_events;
CREATE POLICY "Public Policy Match Events" ON public.match_events FOR ALL USING (true) WITH CHECK (true);
