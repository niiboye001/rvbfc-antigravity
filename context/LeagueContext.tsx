import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { MOCK_PLAYERS, MOCK_TEAMS, generateMockMatches } from '../services/mockData';
import { storage } from '../services/storage';
import { supabase } from '../services/supabase';
import { Match, MatchEvent, Player, Season, Team } from '../types';

interface LeagueContextType {
    teams: Team[];
    players: Player[];
    matches: Match[];
    seasons: Season[];
    currentSeason: Season | null;
    isLoading: boolean;
    addTeam: (team: Team) => Promise<{ success: boolean; error?: 'duplicate' | 'server_error'; team?: Team }>;
    updateTeam: (team: Team) => void;
    deleteTeam: (id: string) => void;
    addPlayer: (player: Player) => Promise<{ success: boolean; error?: 'duplicate' | 'server_error'; player?: Player }>;
    updatePlayer: (player: Player) => void;
    deletePlayer: (id: string) => void;
    addMatch: (match: Match) => Promise<Match | undefined>;
    updateMatch: (match: Match) => Promise<void>;
    deleteMatch: (id: string) => void;
    addSeason: (season: Season) => Promise<void>;
    updateSeason: (season: Season) => Promise<void>;
    deleteSeason: (id: string) => Promise<void>;
    deleteTeams: (ids: string[]) => Promise<void>;
    deletePlayers: (ids: string[]) => Promise<void>;
    fetchSeasonMatches: (seasonId: string) => Promise<void>;
    searchTeams: (query: string) => Promise<Team[]>;
    searchPlayers: (query: string) => Promise<Player[]>;
    refreshData: () => void;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

export const LeagueProvider = ({ children }: { children: ReactNode }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loadedSeasonIds, setLoadedSeasonIds] = useState<Set<string>>(new Set());
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();

        // Real-time subscription for matches
        const matchSubscription = supabase
            .channel('matches-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, async (payload) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    // Refetch the full match with events
                    const { data } = await supabase
                        .from('matches')
                        .select('*, events:match_events(*)')
                        .eq('id', payload.new.id)
                        .single();

                    if (data) {
                        const updatedMatch: Match = {
                            id: data.id,
                            seasonId: data.season_id,
                            homeTeamId: data.home_team_id,
                            awayTeamId: data.away_team_id,
                            homeScore: data.home_score,
                            awayScore: data.away_score,
                            isFinished: data.is_finished,
                            date: data.date,
                            events: data.events?.map((ev: any) => ({
                                id: ev.id,
                                type: ev.type,
                                playerId: ev.player_id,
                                teamId: ev.team_id,
                                assistantId: ev.assistant_id,
                                minute: ev.minute
                            })) || []
                        };

                        if (payload.eventType === 'INSERT') {
                            setMatches(prev => [...prev, updatedMatch]);
                        } else {
                            setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
                        }
                    }
                } else if (payload.eventType === 'DELETE') {
                    setMatches(prev => prev.filter(m => m.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            matchSubscription.unsubscribe();
        };
    }, []);

    const loadData = async () => {
        let finalTeams: Team[] = [];
        let finalPlayers: Player[] = [];
        let finalSeasons: Season[] = [];
        let finalMatches: Match[] = [];

        if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
            try {
                const { data: teamsData } = await supabase.from('teams').select('*');
                const { data: playersData } = await supabase.from('players').select('*');
                const { data: seasonsData } = await supabase.from('seasons').select('*');

                // 1. Get Seasons first to find current
                finalSeasons = seasonsData?.map(s => ({
                    id: s.id,
                    name: s.name,
                    year: s.year,
                    sequence: s.sequence,
                    isCurrent: s.is_current
                })) || [];

                const currentSeason = finalSeasons.find(s => s.isCurrent) || finalSeasons[0];
                const currentSeasonId = currentSeason?.id;

                // 2. Fetch Matches ONLY for current season initially
                let initialMatchesData: any[] = [];
                if (currentSeasonId) {
                    const { data: currentMatches } = await supabase
                        .from('matches')
                        .select('*, events:match_events(*)')
                        .eq('season_id', currentSeasonId);
                    initialMatchesData = currentMatches || [];
                    setLoadedSeasonIds(new Set([currentSeasonId]));
                }

                // Map Data
                finalTeams = teamsData?.map(t => ({
                    id: t.id,
                    seasonId: t.season_id,
                    name: t.name,
                    initials: t.initials,
                    color: t.color,
                    logoUrl: t.logo_url
                })) as Team[] || [];

                finalPlayers = playersData?.map(p => ({
                    id: p.id,
                    name: p.name,
                    teamId: p.team_id,
                    goals: p.goals,
                    assists: p.assists,
                    yellowCards: p.yellow_cards,
                    redCards: p.red_cards
                })) || [];

                finalMatches = initialMatchesData.map(m => ({
                    id: m.id,
                    seasonId: m.season_id,
                    homeTeamId: m.home_team_id,
                    awayTeamId: m.away_team_id,
                    homeScore: m.home_score,
                    awayScore: m.away_score,
                    isFinished: m.is_finished,
                    date: m.date,
                    events: m.events?.map((ev: any) => ({
                        id: ev.id,
                        type: ev.type,
                        playerId: ev.player_id,
                        teamId: ev.team_id,
                        assistantId: ev.assistant_id,
                        minute: ev.minute
                    })) || []
                }));

                setTeams(finalTeams);
                setPlayers(finalPlayers);
                setSeasons(finalSeasons);
                setMatches(finalMatches);
                setIsLoading(false);
                return;
            } catch (error) {
                console.error('Supabase fetch error:', error);
                setIsLoading(false);
                return;
            }
        }

        // Fallback to local storage/mock data
        let loadedTeams = await storage.loadData(storage.KEYS.TEAMS) || [];
        let loadedPlayers = await storage.loadData(storage.KEYS.PLAYERS) || [];
        let loadedMatches = await storage.loadData(storage.KEYS.MATCHES) || [];
        let loadedSeasons = await storage.loadData(storage.KEYS.SEASONS) || [];

        // Legacy ID Migration
        const idMap: { [key: string]: string } = {
            's1': '11111111-1111-1111-1111-111111111111',
            's2': '22222222-2222-2222-2222-222222222222'
        };

        if (loadedSeasons.some((s: Season) => idMap[s.id])) {
            loadedSeasons = loadedSeasons.map((s: Season) => idMap[s.id] ? { ...s, id: idMap[s.id] } : s);
            loadedMatches = loadedMatches.map((m: Match) => idMap[m.seasonId] ? { ...m, seasonId: idMap[m.seasonId] } : m);
            storage.saveData(storage.KEYS.SEASONS, loadedSeasons);
            storage.saveData(storage.KEYS.MATCHES, loadedMatches);
        }

        if (loadedTeams.length === 0) {
            finalTeams = MOCK_TEAMS;
            storage.saveData(storage.KEYS.TEAMS, finalTeams);
        } else {
            finalTeams = loadedTeams;
        }

        if (loadedPlayers.length === 0) {
            finalPlayers = MOCK_PLAYERS;
            storage.saveData(storage.KEYS.PLAYERS, finalPlayers);
        } else {
            finalPlayers = loadedPlayers;
        }

        if (loadedSeasons.length === 0) {
            const currentYear = new Date().getFullYear();
            finalSeasons = [
                { id: '11111111-1111-1111-1111-111111111111', name: `Season 1 ${currentYear}`, year: currentYear, sequence: 1, isCurrent: true },
                { id: '22222222-2222-2222-2222-222222222222', name: `Season 2 ${currentYear}`, year: currentYear, sequence: 2, isCurrent: false },
            ];
            storage.saveData(storage.KEYS.SEASONS, finalSeasons);
        } else {
            finalSeasons = loadedSeasons;
        }

        const currentSeasonId = finalSeasons.find((s: Season) => s.isCurrent)?.id || finalSeasons[0]?.id;

        if (loadedMatches.length === 0 && finalSeasons.length > 0) {
            let allMockMatches: Match[] = [];
            finalSeasons.forEach(season => {
                allMockMatches = [...allMockMatches, ...generateMockMatches(season.id)];
            });
            finalMatches = allMockMatches;
            storage.saveData(storage.KEYS.MATCHES, finalMatches);
        } else {
            finalMatches = loadedMatches;
        }

        setTeams(finalTeams);
        setPlayers(finalPlayers);
        setSeasons(finalSeasons);
        setMatches(finalMatches);
        setIsLoading(false);
    };

    const fetchSeasonMatches = async (seasonId: string) => {
        if (loadedSeasonIds.has(seasonId)) return; // Already loaded

        if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
            try {
                const { data } = await supabase
                    .from('matches')
                    .select('*, events:match_events(*)')
                    .eq('season_id', seasonId);

                if (data) {
                    const newMatches = data.map(m => ({
                        id: m.id,
                        seasonId: m.season_id,
                        homeTeamId: m.home_team_id,
                        awayTeamId: m.away_team_id,
                        homeScore: m.home_score,
                        awayScore: m.away_score,
                        isFinished: m.is_finished,
                        date: m.date,
                        events: m.events?.map((ev: any) => ({
                            id: ev.id,
                            type: ev.type,
                            playerId: ev.player_id,
                            teamId: ev.team_id,
                            assistantId: ev.assistant_id,
                            minute: ev.minute
                        })) || []
                    }));

                    setMatches(prev => {
                        // Avoid duplicates if any
                        const existingIds = new Set(prev.map(m => m.id));
                        const uniqueNew = newMatches.filter((m: Match) => !existingIds.has(m.id));
                        return [...prev, ...uniqueNew];
                    });
                    setLoadedSeasonIds(prev => new Set([...prev, seasonId]));
                }
            } catch (error) {
                console.error('Error fetching season matches:', error);
            }
        }
    };

    const searchTeams = async (query: string): Promise<Team[]> => {
        if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
            // Fallback to local filtering
            return teams.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
        }

        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .ilike('name', `%${query}%`)
            .limit(20);

        if (error || !data) {
            console.error('Search teams error:', error);
            return [];
        }

        return data.map(t => ({
            id: t.id,
            seasonId: t.season_id,
            name: t.name,
            initials: t.initials,
            color: t.color,
            logoUrl: t.logo_url
        }));
    };

    const searchPlayers = async (query: string): Promise<Player[]> => {
        if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
            return players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
        }

        const { data, error } = await supabase
            .from('players')
            .select('*')
            .ilike('name', `%${query}%`)
            .limit(20);

        if (error || !data) {
            console.error('Search players error:', error);
            return [];
        }

        return data.map(p => ({
            id: p.id,
            name: p.name,
            teamId: p.team_id,
            goals: p.goals,
            assists: p.assists,
            yellowCards: p.yellow_cards,
            redCards: p.red_cards
        }));
    };

    const addTeam = async (team: Team): Promise<{ success: boolean; error?: 'duplicate' | 'server_error'; team?: Team }> => {
        // 1. Duplicate Check
        const normalizedName = team.name.trim().toLowerCase();
        const isDuplicate = teams.some(t =>
            t.seasonId === team.seasonId &&
            t.name.trim().toLowerCase() === normalizedName
        );

        if (isDuplicate) {
            return { success: false, error: 'duplicate' };
        }

        // 2. Insert
        const { data, error } = await supabase.from('teams').insert({
            season_id: team.seasonId,
            name: team.name,
            initials: team.initials,
            color: team.color
        }).select().single();

        if (error) {
            console.error('Error adding team:', error);
            return { success: false, error: 'server_error' };
        }

        const newTeam: Team = {
            id: data.id,
            seasonId: data.season_id,
            name: data.name,
            initials: data.initials,
            color: data.color
        };

        const updated = [...teams, newTeam];
        setTeams(updated);
        storage.saveData(storage.KEYS.TEAMS, updated);
        return { success: true, team: newTeam };
    };

    const updateTeam = async (team: Team) => {
        const updated = teams.map(t => t.id === team.id ? team : t);
        setTeams(updated);
        storage.saveData(storage.KEYS.TEAMS, updated);
        await supabase.from('teams').update({
            season_id: team.seasonId,
            name: team.name,
            initials: team.initials,
            color: team.color,
            logo_url: team.logoUrl
        }).eq('id', team.id);
    };

    const deleteTeam = async (id: string) => {
        // 1. Optimistic UI Update
        const updatedTeams = teams.filter(t => t.id !== id);
        const updatedPlayers = players.filter(p => p.teamId !== id);
        const updatedMatches = matches.filter(m => m.homeTeamId !== id && m.awayTeamId !== id);

        setTeams(updatedTeams);
        setPlayers(updatedPlayers);
        setMatches(updatedMatches);

        storage.saveData(storage.KEYS.TEAMS, updatedTeams);
        storage.saveData(storage.KEYS.PLAYERS, updatedPlayers);
        storage.saveData(storage.KEYS.MATCHES, updatedMatches);

        // 2. DB Delete (Cascade handles children)
        try {
            await supabase.from('teams').delete().eq('id', id);
        } catch (error) {
            console.error('Error deleting team:', error);
            // In a real app, we might revert UI state here
        }
    };

    const deleteTeams = async (ids: string[]) => {
        // 1. Optimistic UI Update
        const updatedTeams = teams.filter(t => !ids.includes(t.id));
        const updatedPlayers = players.filter(p => !ids.includes(p.teamId));
        const updatedMatches = matches.filter(m => !ids.includes(m.homeTeamId) && !ids.includes(m.awayTeamId));

        setTeams(updatedTeams);
        setPlayers(updatedPlayers);
        setMatches(updatedMatches);

        storage.saveData(storage.KEYS.TEAMS, updatedTeams);
        storage.saveData(storage.KEYS.PLAYERS, updatedPlayers);
        storage.saveData(storage.KEYS.MATCHES, updatedMatches);

        // 2. DB Delete (Cascade handles children)
        try {
            await supabase.from('teams').delete().in('id', ids);
        } catch (error) {
            console.error('Error bulk deleting teams:', error);
        }
    };

    const addPlayer = async (player: Player): Promise<{ success: boolean; error?: 'duplicate' | 'server_error'; player?: Player }> => {
        // 1. Duplicate Check
        const normalizedName = player.name.trim().toLowerCase();
        const isDuplicate = players.some(p =>
            p.teamId === player.teamId &&
            p.name.trim().toLowerCase() === normalizedName
        );

        if (isDuplicate) {
            return { success: false, error: 'duplicate' };
        }

        // 2. Insert
        const { data, error } = await supabase.from('players').insert({
            team_id: player.teamId,
            name: player.name,
            goals: player.goals,
            assists: player.assists,
            yellow_cards: player.yellowCards,
            red_cards: player.redCards
        }).select().single();

        if (error) {
            console.error('Error adding player:', error);
            return { success: false, error: 'server_error' };
        }

        const newPlayer: Player = {
            id: data.id,
            name: data.name,
            teamId: data.team_id,
            goals: data.goals,
            assists: data.assists,
            yellowCards: data.yellow_cards,
            redCards: data.red_cards
        };

        const updated = [...players, newPlayer];
        setPlayers(updated);
        storage.saveData(storage.KEYS.PLAYERS, updated);
        return { success: true, player: newPlayer };
    };

    const updatePlayer = async (player: Player) => {
        const updated = players.map(p => p.id === player.id ? player : p);
        setPlayers(updated);
        storage.saveData(storage.KEYS.PLAYERS, updated);
        await supabase.from('players').update({
            name: player.name,
            team_id: player.teamId,
            goals: player.goals,
            assists: player.assists,
            yellow_cards: player.yellowCards,
            red_cards: player.redCards
        }).eq('id', player.id);
    };

    const deletePlayer = async (id: string) => {
        // 1. Optimistic UI Update
        const updatedMatches = matches.map(m => ({
            ...m,
            events: m.events?.filter(e => e.playerId !== id && e.assistantId !== id) || []
        }));
        const updatedPlayers = players.filter(p => p.id !== id);

        setMatches(updatedMatches);
        setPlayers(updatedPlayers);

        storage.saveData(storage.KEYS.MATCHES, updatedMatches);
        storage.saveData(storage.KEYS.PLAYERS, updatedPlayers);

        // 2. DB Delete (Cascade handles events)
        try {
            await supabase.from('players').delete().eq('id', id);
        } catch (error) {
            console.error('Error deleting player:', error);
        }
    };

    const deletePlayers = async (ids: string[]) => {
        // 1. Optimistic UI Update
        const updatedMatches = matches.map(m => ({
            ...m,
            events: m.events?.filter(e => !ids.includes(e.playerId) && (!e.assistantId || !ids.includes(e.assistantId))) || []
        }));
        const updatedPlayers = players.filter(p => !ids.includes(p.id));

        setMatches(updatedMatches);
        setPlayers(updatedPlayers);

        storage.saveData(storage.KEYS.MATCHES, updatedMatches);
        storage.saveData(storage.KEYS.PLAYERS, updatedPlayers);

        // 2. DB Delete (Cascade handles events)
        try {
            await supabase.from('players').delete().in('id', ids);
        } catch (error) {
            console.error('Error bulk deleting players:', error);
        }
    };

    const addMatch = async (match: Match) => {
        // Validation: Prevent self-matches and negative scores
        if (match.homeTeamId === match.awayTeamId) {
            console.error('Validation Error: Home and Away teams cannot be the same.');
            return;
        }
        if (match.homeScore < 0 || match.awayScore < 0) {
            console.error('Validation Error: Scores cannot be negative.');
            return;
        }

        // 1. Insert Match
        const { data: matchData, error: matchError } = await supabase.from('matches').insert({
            season_id: match.seasonId,
            home_team_id: match.homeTeamId,
            away_team_id: match.awayTeamId,
            home_score: match.homeScore,
            away_score: match.awayScore,
            is_finished: match.isFinished,
            date: match.date
        }).select().single();

        if (matchError) {
            console.error('Error adding match:', matchError);
            return;
        }

        // 2. Insert Events
        let insertedEvents: MatchEvent[] = [];
        if (match.events && match.events.length > 0) {
            const eventsToInsert = match.events.map(ev => ({
                match_id: matchData.id,
                team_id: ev.teamId,
                player_id: ev.playerId,
                assistant_id: ev.assistantId,
                type: ev.type,
                minute: ev.minute
            }));
            const { data: eventsData, error: eventsError } = await supabase.from('match_events').insert(eventsToInsert).select();

            if (eventsError) console.error('Error adding events:', eventsError);
            else {
                insertedEvents = eventsData.map((ev: any) => ({
                    id: ev.id,
                    type: ev.type,
                    playerId: ev.player_id,
                    teamId: ev.team_id,
                    assistantId: ev.assistant_id,
                    minute: ev.minute
                }));
            }
        }

        const newMatch: Match = {
            id: matchData.id,
            seasonId: matchData.season_id,
            homeTeamId: matchData.home_team_id,
            awayTeamId: matchData.away_team_id,
            homeScore: matchData.home_score,
            awayScore: matchData.away_score,
            isFinished: matchData.is_finished,
            date: matchData.date,
            events: insertedEvents
        };

        const updated = [...matches, newMatch];
        setMatches(updated);
        storage.saveData(storage.KEYS.MATCHES, updated);
        return newMatch;
    };

    const updateMatch = async (match: Match) => {
        // Validation: Prevent self-matches and negative scores
        if (match.homeTeamId === match.awayTeamId) {
            console.error('Validation Error: Home and Away teams cannot be the same.');
            return;
        }
        if (match.homeScore < 0 || match.awayScore < 0) {
            console.error('Validation Error: Scores cannot be negative.');
            return;
        }

        // 1. Update Match Meta
        const { error: matchError } = await supabase.from('matches').update({
            home_team_id: match.homeTeamId,
            away_team_id: match.awayTeamId,
            home_score: match.homeScore,
            away_score: match.awayScore,
            is_finished: match.isFinished,
            date: match.date
        }).eq('id', match.id);

        if (matchError) {
            console.error('Error updating match:', matchError);
            return;
        }

        // 2. Replace Events (Delete all, then Insert new)
        // Delete all existing events for this match
        await supabase.from('match_events').delete().eq('match_id', match.id);

        // Insert new events
        let insertedEvents: MatchEvent[] = [];
        if (match.events && match.events.length > 0) {
            const eventsToInsert = match.events.map(ev => ({
                match_id: match.id,
                team_id: ev.teamId,
                player_id: ev.playerId,
                assistant_id: ev.assistantId,
                type: ev.type,
                minute: ev.minute
            }));
            const { data: eventsData, error: eventsError } = await supabase.from('match_events').insert(eventsToInsert).select();

            if (eventsError) console.error('Error updating events:', eventsError);
            else {
                insertedEvents = eventsData.map((ev: any) => ({
                    id: ev.id,
                    type: ev.type,
                    playerId: ev.player_id,
                    teamId: ev.team_id,
                    assistantId: ev.assistant_id,
                    minute: ev.minute
                }));
            }
        }

        // Update local state with the newly inserted events IDs (though the UI might not care until reload)
        const updatedMatch: Match = { ...match, events: insertedEvents };
        const updated = matches.map(m => m.id === match.id ? updatedMatch : m);
        setMatches(updated);
        storage.saveData(storage.KEYS.MATCHES, updated);
    };

    const deleteMatch = async (id: string) => {
        const updated = matches.filter(m => m.id !== id);
        setMatches(updated);
        storage.saveData(storage.KEYS.MATCHES, updated);
        await supabase.from('matches').delete().eq('id', id);
    };

    const addSeason = async (season: Season) => {
        // 1. If new season is Current, update others in DB to false
        if (season.isCurrent) {
            await supabase.from('seasons').update({ is_current: false }).neq('id', '00000000-0000-0000-0000-000000000000'); // update all
            // Update local state immediately to reflect this
            setSeasons(prev => prev.map(s => ({ ...s, isCurrent: false })));
        }

        // 2. Insert new Season
        const { data, error } = await supabase.from('seasons').insert({
            name: season.name,
            year: season.year,
            sequence: season.sequence,
            is_current: season.isCurrent
        }).select().single();

        if (error) {
            console.error('Error adding season:', error);
            return;
        }

        const newSeason: Season = {
            id: data.id,
            name: data.name,
            year: data.year,
            sequence: data.sequence,
            isCurrent: data.is_current
        };

        // 3. Update State & Storage
        setSeasons(prev => {
            const updated = prev.map(s => newSeason.isCurrent ? { ...s, isCurrent: false } : s);
            const final = [...updated, newSeason].sort((a, b) => (b.year - a.year) || (b.sequence - a.sequence));
            storage.saveData(storage.KEYS.SEASONS, final);
            return final;
        });
    };

    const updateSeason = async (season: Season) => {
        // 1. If setting as Current, update others
        if (season.isCurrent) {
            await supabase.from('seasons').update({ is_current: false }).neq('id', season.id);
            setSeasons(prev => prev.map(s => ({ ...s, isCurrent: s.id === season.id }))); // Temp optimization
        }

        // 2. Update DB
        const { error } = await supabase.from('seasons').update({
            name: season.name,
            year: season.year,
            sequence: season.sequence,
            is_current: season.isCurrent
        }).eq('id', season.id);

        if (error) {
            console.error('Error updating season:', error);
            return;
        }

        // 3. Update Local State
        setSeasons(prev => {
            const updated = prev.map(s => {
                if (s.id === season.id) return season;
                if (season.isCurrent) return { ...s, isCurrent: false };
                return s;
            });
            const final = updated.sort((a, b) => (b.year - a.year) || (b.sequence - a.sequence));
            storage.saveData(storage.KEYS.SEASONS, final);
            return final;
        });
    };

    const deleteSeason = async (id: string) => {
        const seasonToDelete = seasons.find(s => s.id === id);
        const { error } = await supabase.from('seasons').delete().eq('id', id);

        if (error) {
            console.error('Error deleting season:', error);
            return;
        }

        let updatedSeasons = seasons.filter(s => s.id !== id);

        // If we deleted the current season, we must assign a new one
        if (seasonToDelete?.isCurrent && updatedSeasons.length > 0) {
            // Sort to find the most recent season (highest year, then highest sequence)
            updatedSeasons.sort((a, b) => (b.year - a.year) || (b.sequence - a.sequence));

            const newCurrent = updatedSeasons[0];

            // 1. Update DB
            await supabase.from('seasons').update({ is_current: true }).eq('id', newCurrent.id);

            // 2. Update Local State
            updatedSeasons = updatedSeasons.map((s, index) =>
                index === 0 ? { ...s, isCurrent: true } : s
            );
        }

        setSeasons(updatedSeasons);
        storage.saveData(storage.KEYS.SEASONS, updatedSeasons);
    };



    const currentSeason = seasons.find(s => s.isCurrent) || seasons[0] || null;

    return (
        <LeagueContext.Provider value={{
            teams, players, matches, seasons, currentSeason, isLoading,
            addTeam, updateTeam, deleteTeam, deleteTeams,
            addPlayer, updatePlayer, deletePlayer, deletePlayers,
            addMatch, updateMatch, deleteMatch,
            addSeason, updateSeason, deleteSeason, // Exported
            fetchSeasonMatches, searchTeams, searchPlayers,
            refreshData: loadData
        }}>
            {children}
        </LeagueContext.Provider>
    );
};

export const useLeague = () => {
    const context = useContext(LeagueContext);
    if (!context) throw new Error('useLeague must be used within a LeagueProvider');
    return context;
};
