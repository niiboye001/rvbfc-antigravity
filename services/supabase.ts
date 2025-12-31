import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// These should be moved to a .env file later
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

/**
 * DATABASE SCHEMA SQL
 * Run this in your Supabase SQL Editor:
 * 
 * -- Enable UUID extension
 * create extension if not exists "uuid-ossp";
 * 
 * -- SEASONS Table
 * create table seasons (
 *   id uuid primary key default uuid_generate_v4(),
 *   name text not null,
 *   year integer not null,
 *   sequence integer not null,
 *   is_current boolean default false,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- TEAMS Table
 * create table teams (
 *   id uuid primary key default uuid_generate_v4(),
 *   name text not null,
 *   initials text not null,
 *   color text not null,
 *   logo_url text,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- PLAYERS Table
 * create table players (
 *   id uuid primary key default uuid_generate_v4(),
 *   team_id uuid references teams(id) on delete cascade,
 *   name text not null,
 *   goals integer default 0,
 *   assists integer default 0,
 *   yellow_cards integer default 0,
 *   red_cards integer default 0,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- MATCHES Table
 * create table matches (
 *   id uuid primary key default uuid_generate_v4(),
 *   season_id uuid references seasons(id) on delete cascade,
 *   home_team_id uuid references teams(id) on delete cascade,
 *   away_team_id uuid references teams(id) on delete cascade,
 *   home_score integer default 0,
 *   away_score integer default 0,
 *   is_finished boolean default false,
 *   date timestamp with time zone default timezone('utc'::text, now()) not null,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- MATCH_EVENTS Table
 * create table match_events (
 *   id uuid primary key default uuid_generate_v4(),
 *   match_id uuid references matches(id) on delete cascade,
 *   team_id uuid references teams(id) on delete cascade,
 *   player_id uuid references players(id) on delete cascade,
 *   assistant_id uuid references players(id) on delete set null,
 *   type text not null, -- GOAL, ASSIST, YELLOW_CARD, RED_CARD
 *   minute integer default 0,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- ROW LEVEL SECURITY (RLS)
 * alter table seasons enable row level security;
 * alter table teams enable row level security;
 * alter table players enable row level security;
 * alter table matches enable row level security;
 * alter table match_events enable row level security;
 * 
 * -- PUBLIC READ ACCESS
 * create policy "Public Access" on seasons for select using (true);
 * create policy "Public Access" on teams for select using (true);
 * create policy "Public Access" on players for select using (true);
 * create policy "Public Access" on matches for select using (true);
 * create policy "Public Access" on match_events for select using (true);
 * 
 * -- ADMIN WRITE ACCESS (Only for Authenticated Users)
 * create policy "Admin Insert" on seasons for insert with check (auth.role() = 'authenticated');
 * create policy "Admin Update" on seasons for update using (auth.role() = 'authenticated');
 * create policy "Admin Delete" on seasons for delete using (auth.role() = 'authenticated');
 * 
 * create policy "Admin Insert" on teams for insert with check (auth.role() = 'authenticated');
 * create policy "Admin Update" on teams for update using (auth.role() = 'authenticated');
 * create policy "Admin Delete" on teams for delete using (auth.role() = 'authenticated');
 * 
 * create policy "Admin Insert" on players for insert with check (auth.role() = 'authenticated');
 * create policy "Admin Update" on players for update using (auth.role() = 'authenticated');
 * create policy "Admin Delete" on players for delete using (auth.role() = 'authenticated');
 * 
 * create policy "Admin Insert" on matches for insert with check (auth.role() = 'authenticated');
 * create policy "Admin Update" on matches for update using (auth.role() = 'authenticated');
 * create policy "Admin Delete" on matches for delete using (auth.role() = 'authenticated');
 * 
 * create policy "Admin Delete" on match_events for delete using (auth.role() = 'authenticated');
 * 
 * -- SEED DEFAULT SEASONS
 * insert into seasons (id, name, year, sequence, is_current) values
 * ('11111111-1111-1111-1111-111111111111', 'Season 1 2025', 2025, 1, true),
 * ('22222222-2222-2222-2222-222222222222', 'Season 2 2025', 2025, 2, false);
 */
