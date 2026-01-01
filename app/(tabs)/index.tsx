import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { TrendingUp, Trophy, User, Users } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StatusBar as RNStatusBar, ScrollView, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CountingText } from '../../components/CountingText';
import StatsCard from '../../components/StatsCard';
import { useLeague } from '../../context/LeagueContext';

export default function DashboardScreen() {
  const { teams, players, matches, seasons, currentSeason, refreshData, isLoading } = useLeague();
  const [refreshing, setRefreshing] = useState(false);

  // Ensure status bar is dark when this screen is focused
  useFocusEffect(
    useCallback(() => {
      RNStatusBar.setBarStyle('dark-content');
      return () => { };
    }, [])
  );

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Stats
  const totalTeams = teams.length;
  const totalPlayers = players.length;

  // Calculate Top Performers for current season dynamically
  const { topScorerData, topAssisterData } = useMemo(() => {
    if (!currentSeason) return { topScorerData: null, topAssisterData: null };

    const seasonMatches = matches.filter(m => m.seasonId === currentSeason.id);
    const playerStats: Record<string, { goals: number, assists: number }> = {};

    seasonMatches.forEach(match => {
      match.events?.forEach(event => {
        if (!playerStats[event.playerId]) {
          playerStats[event.playerId] = { goals: 0, assists: 0 };
        }
        if (event.type === 'GOAL') {
          playerStats[event.playerId].goals++;
          if (event.assistantId) {
            if (!playerStats[event.assistantId]) {
              playerStats[event.assistantId] = { goals: 0, assists: 0 };
            }
            playerStats[event.assistantId].assists++;
          }
        } else if (event.type === 'ASSIST') {
          playerStats[event.playerId].assists++;
        }
      });
    });

    const playerListWithStats = players.map(p => ({
      ...p,
      goals: playerStats[p.id]?.goals || 0,
      assists: playerStats[p.id]?.assists || 0
    }));

    const maxGoals = Math.max(...playerListWithStats.map(p => p.goals));
    const maxAssists = Math.max(...playerListWithStats.map(p => p.assists));

    const topScorers = playerListWithStats.filter(p => p.goals === maxGoals && maxGoals > 0);
    const topAssisters = playerListWithStats.filter(p => p.assists === maxAssists && maxAssists > 0);

    return {
      topScorerData: topScorers.length > 0 ? {
        player: topScorers[0],
        extraCount: topScorers.length - 1
      } : null,
      topAssisterData: topAssisters.length > 0 ? {
        player: topAssisters[0],
        extraCount: topAssisters.length - 1
      } : null
    };
  }, [players, matches, currentSeason]);






  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-secondary">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Current Match (Latest finished or ongoing)
  const currentMatch = [...matches]
    .sort((a, b) => {
      const timeA = a?.date ? new Date(a.date).getTime() : 0;
      const timeB = b?.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    })[0];

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown';
  const getTeamColor = (id: string) => teams.find(t => t.id === id)?.color || '#94a3b8';
  const getTeamInitials = (id: string) => teams.find(t => t.id === id)?.initials || '??';

  // Calculate Historical Points for all seasons
  // Sort seasons and teams for consistent display
  const sortedSeasons = useMemo(() =>
    [...seasons].sort((a, b) => (a.sequence || 0) - (b.sequence || 0)),
    [seasons]);

  const sortedTeams = useMemo(() =>
    [...teams].sort((a, b) => a.name.localeCompare(b.name)),
    [teams]);

  // Calculate Historical Points for all seasons
  const chartData = useMemo(() => {
    if (teams.length === 0 || sortedSeasons.length === 0) {
      return [{ value: 0, label: '-', frontColor: '#ccc' }];
    }

    const groupedData: any[] = [];

    sortedSeasons.forEach((season) => {
      sortedTeams.forEach((team, tIdx) => {
        const seasonMatches = matches.filter(m =>
          m.seasonId === season.id &&
          m.isFinished &&
          (m.homeTeamId === team.id || m.awayTeamId === team.id)
        );

        let points = 0;
        seasonMatches.forEach(m => {
          const isHome = m.homeTeamId === team.id;
          if (isHome) {
            if (m.homeScore > m.awayScore) points += 3;
            else if (m.homeScore === m.awayScore) points += 1;
          } else {
            if (m.awayScore > m.homeScore) points += 3;
            else if (m.awayScore === m.homeScore) points += 1;
          }
        });

        const isFirstInGroup = tIdx === 0;
        const isLastInGroup = tIdx === sortedTeams.length - 1;

        groupedData.push({
          value: points,
          frontColor: team.color || '#3b82f6',
          spacing: isLastInGroup ? 24 : 8, // Breathing room between groups
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          topLabelComponent: () => (
            <View className="items-center" style={{ marginBottom: 4 }}>
              <Text
                className="text-[9px] font-bold text-slate-500"
              >
                {team.initials}
              </Text>
            </View>
          ),
          labelComponent: isFirstInGroup ? () => (
            <View className="items-center" style={{ marginTop: 8, width: sortedTeams.length * 28 + 16 }}>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">S{season.sequence}</Text>
            </View>
          ) : undefined,
          // Ensure even small points are visible
          minHeight: points > 0 ? 6 : 0,
        });
      });
    });

    return groupedData;
  }, [teams, sortedSeasons, sortedTeams, matches]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-secondary">
      <RNStatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
      >
        {/* Header section */}
        <View className="px-6 py-8">
          <View className="flex-row justify-between items-center mb-1">
            <View>
              <Text className="text-slate-400 text-xs font-black uppercase tracking-[3px] mb-1">Dashboard</Text>
              <Text className="text-3xl font-black text-slate-900">{currentSeason?.name || 'League Hub'}</Text>
            </View>
            <View className="bg-blue-500/10 p-3 rounded-2xl">
              <Trophy size={28} color="#3b82f6" />
            </View>
          </View>
        </View>

        {/* Overview Row */}
        <View className="flex-row px-6 mb-8 gap-4">
          <StatsCard
            title="Teams"
            value={totalTeams}
            icon={Users}
            color="#6366f1"
            onPress={() => { }}
            shouldAnimate={!isLoading}
          />
          <StatsCard
            title="Players"
            value={totalPlayers}
            icon={User}
            color="#10b981"
            onPress={() => { }}
            shouldAnimate={!isLoading}
          />
        </View>

        {/* Hero Section: Latest Match */}
        <View className="px-6 mb-8">
          <View className="bg-white rounded-3xl p-8 shadow-sm border border-slate-50 overflow-hidden relative">
            {/* Design Elements */}
            <View className="absolute top-[-20] right-[-20] w-40 h-40 bg-blue-500/5 rounded-full" />
            <View className="absolute bottom-[-10] left-[20%] w-20 h-20 bg-indigo-500/5 rounded-full" />

            <View className="flex-row items-center mb-8">
              <View className="bg-slate-50 p-2 rounded-xl mr-3">
                <Trophy size={14} color="#f59e0b" />
              </View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px]">Matchday Report</Text>
            </View>

            {currentMatch ? (
              <View>
                <View className="flex-row justify-between items-center">
                  <View className="items-center flex-1">
                    <View
                      className="w-16 h-16 rounded-3xl items-center justify-center mb-4 border border-slate-100"
                      style={{ backgroundColor: `${getTeamColor(currentMatch.homeTeamId)}20` }}
                    >
                      <Text className="text-2xl font-black text-slate-900">{getTeamInitials(currentMatch.homeTeamId)}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mx-2 h-16">
                    <Text className="text-5xl font-black text-slate-900 tracking-tighter">{currentMatch.homeScore}</Text>
                    <View className="w-4 h-[2px] bg-slate-200 mx-4" />
                    <Text className="text-5xl font-black text-slate-900 tracking-tighter">{currentMatch.awayScore}</Text>
                  </View>

                  <View className="items-center flex-1">
                    <View
                      className="w-16 h-16 rounded-3xl items-center justify-center mb-4 border border-slate-100"
                      style={{ backgroundColor: `${getTeamColor(currentMatch.awayTeamId)}20` }}
                    >
                      <Text className="text-2xl font-black text-slate-900">{getTeamInitials(currentMatch.awayTeamId)}</Text>
                    </View>
                  </View>
                </View>

                <View className="mt-8 pt-6 border-t border-slate-100 flex-row justify-center items-center">
                  <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[1px]">
                    {new Date(currentMatch.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="py-10 items-center">
                <Text className="text-slate-400 font-bold italic">No match records found</Text>
              </View>
            )}
          </View>
        </View>

        {/* Performance Grid */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-end mb-4 px-1">
            <Text className="text-slate-900 text-xl font-black">Top Performers</Text>
            <Text className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Season {currentSeason?.year}</Text>
          </View>

          <View className="flex-row gap-4">
            {/* Top Scorer */}
            <View className="flex-1 bg-white p-6 rounded-3xl border border-slate-50 relative overflow-hidden">
              <View className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-[40px]" />
              <View className="w-12 h-12 rounded-2xl items-center justify-center mb-4 bg-amber-500/10">
                <Trophy size={20} color="#f59e0b" />
              </View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Goal King</Text>
              <Text className="text-xl font-black text-slate-900 mb-2" numberOfLines={1}>
                {topScorerData ? topScorerData.player.name : '—'}
                {topScorerData?.extraCount ? `+` : ''}
              </Text>
              <View className="flex-row items-center bg-slate-50 self-start px-3 py-1 rounded-full">
                <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: topScorerData ? getTeamColor(topScorerData.player.teamId) : '#cbd5e1' }} />
                <CountingText
                  value={topScorerData?.player.goals || 0}
                  shouldAnimate={!isLoading}
                  className="text-[10px] font-black text-slate-600 uppercase tracking-tighter"
                />
                <Text className="text-[10px] font-black text-slate-600 uppercase tracking-tighter"> Goals</Text>
              </View>
            </View>

            {/* Top Assister */}
            <View className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-50 relative overflow-hidden">
              <View className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-[40px]" />
              <View className="w-12 h-12 rounded-2xl items-center justify-center mb-4 bg-indigo-500/10">
                <Users size={20} color="#6366f1" />
              </View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Assist Pro</Text>
              <Text className="text-xl font-black text-slate-900 mb-2" numberOfLines={1}>
                {topAssisterData ? topAssisterData.player.name : '—'}
                {topAssisterData?.extraCount ? `+` : ''}
              </Text>
              <View className="flex-row items-center bg-slate-50 self-start px-3 py-1 rounded-full">
                <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: topAssisterData ? getTeamColor(topAssisterData.player.teamId) : '#cbd5e1' }} />
                <CountingText
                  value={topAssisterData?.player.assists || 0}
                  shouldAnimate={!isLoading}
                  className="text-[10px] font-black text-slate-600 uppercase tracking-tighter"
                />
                <Text className="text-[10px] font-black text-slate-600 uppercase tracking-tighter"> Assists</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Standings Chart */}
        <View className="px-6">
          <View className="bg-white p-6 rounded-3xl border border-slate-50">
            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row items-center">
                <View className="bg-indigo-500/10 p-2 rounded-xl mr-3">
                  <TrendingUp size={16} color="#6366f1" />
                </View>
                <Text className="text-slate-900 text-sm font-black uppercase tracking-widest">Season Standings</Text>
              </View>
              <View className="bg-slate-50 px-3 py-1 rounded-full">
                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Points</Text>
              </View>
            </View>

            <View className="flex-row items-center mr-6">
              {/* Y-Axis Label */}
              <View
                style={{
                  transform: [{ rotate: '-90deg' }],
                  width: 160,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  left: -75,
                  top: 90
                }}
              >
                <Text className="text-[9px] font-bold text-slate-300 uppercase tracking-[3px]">Points</Text>
              </View>

              <View className="ml-4 w-full">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="w-[100vw]">
                    <BarChart
                      data={chartData}
                      width={sortedSeasons.length * (sortedTeams.length * 28 + 16)} // Adjusted for new spacing
                      noOfSections={4}
                      height={180}
                      barWidth={20}
                      barBorderTopRightRadius={3}
                      barBorderTopLeftRadius={3}
                      barBorderBottomLeftRadius={0}
                      barBorderBottomRightRadius={0}
                      yAxisThickness={0}
                      xAxisThickness={1}
                      yAxisColor="#fff" // Hide Y axis line
                      xAxisColor="#e2e8f0" // Slate-200 for subtle line
                      yAxisTextStyle={{ color: '#94a3b8', fontSize: 10, fontWeight: '500' }}
                      rulesColor="#f1f5f9"
                      rulesType="dashed"
                      dashGap={4}
                      dashWidth={4}
                      animationDuration={1000}
                      maxValue={20}
                    />

                    {/* Clean Year Indicators */}
                    <View className="flex-row mt-2" style={{ marginLeft: 0 }}>
                      {Array.from(new Set(sortedSeasons.map(s => s.year))).sort().map((year: number) => {
                        const seasonsInYear = sortedSeasons.filter(s => s.year === year).length;
                        const seasonWidth = sortedTeams.length * 28 + 68;
                        return (
                          <View key={year.toString()} className="items-center justify-center pt-2" style={{ width: seasonsInYear * seasonWidth }}>
                            <Text className="text-[10px] font-black text-slate-300 tracking-widest">{year}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
