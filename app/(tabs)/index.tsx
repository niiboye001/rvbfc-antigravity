import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { TrendingUp, Trophy, User, Users } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { RefreshControl, StatusBar as RNStatusBar, ScrollView, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatsCard from '../../components/StatsCard';
import { useLeague } from '../../context/LeagueContext';

export default function DashboardScreen() {
  const { teams, players, matches, currentSeason, refreshData } = useLeague();
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

  // Leading Scorer
  const topScorer = [...players].sort((a, b) => (b?.goals || 0) - (a?.goals || 0))[0];
  const topAssister = [...players].sort((a, b) => (b?.assists || 0) - (a?.assists || 0))[0];

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

  // Calculate Points for current season
  const activeTeamsPoints = teams.map(team => {
    if (!currentSeason) return { value: 0, label: team.initials, frontColor: team.color || '#3b82f6' };

    // Capture ID to ensure TS knows it's defined
    const seasonId = currentSeason.id;

    const seasonMatches = matches.filter(m => m.seasonId === seasonId && m.isFinished && (m.homeTeamId === team.id || m.awayTeamId === team.id));

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

    return {
      value: points,
      label: team.initials,
      frontColor: team.color || '#3b82f6',
      gradientColor: '#cbd5e1', // Lighter gradient
      showGradient: true,
      spacing: 20,
      topLabelComponent: () => (
        <Text className="text-[10px] font-bold text-slate-500 mb-1">{points}</Text>
      ),
    };
  }).sort((a, b) => b.value - a.value);

  // If no data, provide some empty structure or minimal mock to avoid crash
  const chartData = activeTeamsPoints.length > 0 ? activeTeamsPoints : [{ value: 0, label: '-', frontColor: '#ccc' }];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#ECECEC' }}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="text-2xl font-bold text-slate-900 mb-6">Dashboard</Text>

        {/* Top Stats Grid */}
        <View className="flex-row mb-4 gap-4">
          <StatsCard title="Total Teams" value={totalTeams} icon={Users} color="#3b82f6" />
          <StatsCard title="Total Players" value={totalPlayers} icon={User} color="#10b981" />
        </View>

        {/* Match Result */}
        <View className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
          <View className="flex-row items-center mb-4 border-b border-slate-100 pb-2">
            <Trophy size={18} color="#f59e0b" />
            <Text className="text-base font-bold text-slate-800 ml-2">Latest Match Result</Text>
          </View>

          {currentMatch ? (
            <View>
              <View className="flex-row justify-between items-center py-2">
                <View className="items-center flex-1">
                  <Text className="font-bold text-slate-700 mb-1 text-center">{getTeamName(currentMatch.homeTeamId)}</Text>
                  <Text className="text-3xl font-black text-slate-900">{currentMatch.homeScore}</Text>
                </View>
                <Text className="text-sm text-slate-400 font-bold mx-2">VS</Text>
                <View className="items-center flex-1">
                  <Text className="font-bold text-slate-700 mb-1 text-center">{getTeamName(currentMatch.awayTeamId)}</Text>
                  <Text className="text-3xl font-black text-slate-900">{currentMatch.awayScore}</Text>
                </View>
              </View>
              <Text className="text-xs text-slate-400 text-center mt-2">
                {new Date(currentMatch.date).toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <Text className="text-slate-400 text-center py-4">No match data available</Text>
          )}
        </View>

        {/* Top Performers */}
        <View className="flex-row mb-6 gap-4">
          <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200">
            <View className="flex-row items-center mb-2">
              <Trophy size={14} color="#f59e0b" />
              <Text className="text-xs font-bold text-slate-500 uppercase ml-1">Top Scorer</Text>
            </View>
            <Text className="text-lg font-bold text-slate-900">{topScorer ? topScorer.name : '-'}</Text>
            <Text className="text-sm text-slate-500">{topScorer ? `${topScorer.goals} Goals` : ''}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200">
            <View className="flex-row items-center mb-2">
              <Users size={14} color="#6366f1" />
              <Text className="text-xs font-bold text-slate-500 uppercase ml-1">Top Assist</Text>
            </View>
            <Text className="text-lg font-bold text-slate-900">{topAssister ? topAssister.name : '-'}</Text>
            <Text className="text-sm text-slate-500">{topAssister ? `${topAssister.assists} Assists` : ''}</Text>
          </View>
        </View>

        {/* Team Performance Chart */}
        <View className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
          <View className="flex-row items-center mb-4 border-b border-slate-100 pb-2">
            <TrendingUp size={18} color="#6366f1" />
            <Text className="text-base font-bold text-slate-800 ml-2">Season Standings (Points)</Text>
          </View>
          <View className="overflow-hidden">
            <BarChart
              data={chartData}
              barWidth={30}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="#3b82f6"
              gradientColor={'#cbd5e1'}
              showGradient
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              isAnimated
              animationDuration={800}
              yAxisTextStyle={{ color: '#94a3b8' }}
              xAxisLabelTextStyle={{ color: '#64748b', fontSize: 10, fontWeight: 'bold' }}
              height={200}
              width={300}
              adjustToWidth={true}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
