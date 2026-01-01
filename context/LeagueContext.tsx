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
    addTeam: (team: Team) => Promise<Team | undefined>;
    updateTeam: (team: Team) => void;
    deleteTeam: (id: string) => void;
    addPlayer: (player: Player) => Promise<Player | undefined>;
    updatePlayer: (player: Player) => void;
    deletePlayer: (id: string) => void;
    addMatch: (match: Match) => void;
    deleteMatch: (id: string) => void;
    deleteTeams: (ids: string[]) => Promise<void>;
    deletePlayers: (ids: string[]) => Promise<void>;
    refreshData: () => void;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

export const LeagueProvider = ({ children }: { children: ReactNode }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
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
                const { data: matchesData } = await supabase.from('matches').select('*, events:match_events(*)');

                if (teamsData && teamsData.length > 0) {
                    finalTeams = teamsData.map(t => ({
                        id: t.id,
                        name: t.name,
                        initials: t.initials,
                        color: t.color,
                        logoUrl: t.logo_url
                    })) as Team[];

                    finalPlayers = playersData?.map(p => ({
                        id: p.id,
                        name: p.name,
                        teamId: p.team_id,
                        goals: p.goals,
                        assists: p.assists,
                        yellowCards: p.yellow_cards,
                        redCards: p.red_cards
                    })) || [];

                    finalSeasons = seasonsData?.map(s => ({
                        id: s.id,
                        name: s.name,
                        year: s.year,
                        sequence: s.sequence,
                        isCurrent: s.is_current
                    })) || [];

                    finalMatches = matchesData?.map(m => ({
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
                    })) || [];

                    setTeams(finalTeams);
                    setPlayers(finalPlayers);
                    setSeasons(finalSeasons);
                    setMatches(finalMatches);
                    setIsLoading(false);
                    return; // Loaded from cloud successfully
                }
            } catch (error) {
                console.error('Supabase fetch error:', error);
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

    const addTeam = async (team: Team) => {
        // Prepare data for Supabase (omit ID)
        const { data, error } = await supabase.from('teams').insert({
            name: team.name,
            initials: team.initials,
            color: team.color
        }).select().single();

        if (error) {
            console.error('Error adding team:', error);
            return;
        }

        const newTeam: Team = {
            id: data.id,
            name: data.name,
            initials: data.initials,
            color: data.color
        };

        const updated = [...teams, newTeam];
        setTeams(updated);
        storage.saveData(storage.KEYS.TEAMS, updated);
        return newTeam;
    };

    const updateTeam = async (team: Team) => {
        const updated = teams.map(t => t.id === team.id ? team : t);
        setTeams(updated);
        storage.saveData(storage.KEYS.TEAMS, updated);
        await supabase.from('teams').update({
            name: team.name,
            initials: team.initials,
            color: team.color,
            logo_url: team.logoUrl
        }).eq('id', team.id);
    };

    const deleteTeam = async (id: string) => {
        const updated = teams.filter(t => t.id !== id);
        setTeams(updated);
        storage.saveData(storage.KEYS.TEAMS, updated);
        await supabase.from('teams').delete().eq('id', id);
    };

    const deleteTeams = async (ids: string[]) => {
        const updated = teams.filter(t => !ids.includes(t.id));
        setTeams(updated);
        storage.saveData(storage.KEYS.TEAMS, updated);
        await supabase.from('teams').delete().in('id', ids);
    };

    const addPlayer = async (player: Player) => {
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
            return;
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
        return newPlayer;
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
        const updated = players.filter(p => p.id !== id);
        setPlayers(updated);
        storage.saveData(storage.KEYS.PLAYERS, updated);
        await supabase.from('players').delete().eq('id', id);
    };

    const deletePlayers = async (ids: string[]) => {
        const updated = players.filter(p => !ids.includes(p.id));
        setPlayers(updated);
        storage.saveData(storage.KEYS.PLAYERS, updated);
        await supabase.from('players').delete().in('id', ids);
    };

    const addMatch = async (match: Match) => {
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

    const deleteMatch = async (id: string) => {
        const updated = matches.filter(m => m.id !== id);
        setMatches(updated);
        storage.saveData(storage.KEYS.MATCHES, updated);
        await supabase.from('matches').delete().eq('id', id);
    };

    const currentSeason = seasons.find(s => s.isCurrent) || seasons[0] || null;

    return (
        <LeagueContext.Provider value={{
            teams, players, matches, seasons, currentSeason, isLoading,
            addTeam, updateTeam, deleteTeam, deleteTeams,
            addPlayer, updatePlayer, deletePlayer, deletePlayers,
            addMatch, deleteMatch,
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
