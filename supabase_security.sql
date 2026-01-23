-- 1. Enable RLS on all tables
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- 2. Create READ policies (Public can read everything)
CREATE POLICY "Public Read Matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public Read Teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public Read Players" ON players FOR SELECT USING (true);
CREATE POLICY "Public Read Events" ON match_events FOR SELECT USING (true);
CREATE POLICY "Public Read Seasons" ON seasons FOR SELECT USING (true);

-- 3. Create WRITE policies (Only Authenticated Admins can write)
-- Note: 'authenticated' role is assigned by Supabase Auth when a user logs in.

-- Matches
CREATE POLICY "Admin Insert Matches" ON matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Matches" ON matches FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Matches" ON matches FOR DELETE USING (auth.role() = 'authenticated');

-- Teams
CREATE POLICY "Admin Insert Teams" ON teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Teams" ON teams FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Teams" ON teams FOR DELETE USING (auth.role() = 'authenticated');

-- Players
CREATE POLICY "Admin Insert Players" ON players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Players" ON players FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Players" ON players FOR DELETE USING (auth.role() = 'authenticated');

-- Match Events
CREATE POLICY "Admin Insert Events" ON match_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Events" ON match_events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Events" ON match_events FOR DELETE USING (auth.role() = 'authenticated');

-- Seasons (If you have a seasons table)
CREATE POLICY "Admin Insert Seasons" ON seasons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update Seasons" ON seasons FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Seasons" ON seasons FOR DELETE USING (auth.role() = 'authenticated');
