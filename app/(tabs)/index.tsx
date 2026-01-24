import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { Calendar, ChevronRight, TrendingUp, Trophy, User, Users } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { CountingText } from '../../components/CountingText';
import StatsCard from '../../components/StatsCard';
import { useLeague } from '../../context/LeagueContext';
import { useLeagueStats } from '../../hooks/useLeagueStats';

export default function DashboardScreen() {
  const router = useRouter();
  const { teams, players, matches, seasons, currentSeason, refreshData, isLoading } = useLeague();
  const [refreshing, setRefreshing] = useState(false);
  const [seasonAlertVisible, setSeasonAlertVisible] = useState(false);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Check for missing season for current year
  useFocusEffect(
    useCallback(() => {
      if (isLoading) return;

      const currentYear = new Date().getFullYear();
      const hasSeasonForYear = seasons.some(s => s.year === currentYear);

      if (!hasSeasonForYear) {
        setSeasonAlertVisible(true);
      }
    }, [seasons, isLoading])
  );

  // Stats Hook (Refactored)
  const { topScorerData, topAssisterData, chartData, sortedSeasons, sortedTeams, currentMatch } = useLeagueStats();

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown';

  const totalTeams = sortedTeams.length; // Approximate, or filter by current season if needed
  // Note: Original codeFiltered teams by current season for 'totalTeams'. 
  // Let's check hook logic. Hook sorts ALL teams? No, hook sorts ALL teams for width calc, but let's check basic stats.
  // Original: const totalTeams = currentSeasonTeams.length; 
  // Current Hook sortedTeams is ALL teams. 
  // We should probably rely on `teams` from context directly for simple counts if we want, or add `currentSeasonTeams` to hook.
  // For now, let's keep simple counts local or minimal.
  const currentSeasonTeams = useMemo(() => teams.filter(t => t.seasonId === currentSeason?.id), [teams, currentSeason]);
  const totalTeamsCount = currentSeasonTeams.length;

  const totalPlayers = useMemo(() =>
    players.filter(p => currentSeasonTeams.some(t => t.id === p.teamId)).length,
    [players, currentSeasonTeams]
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Fixed Header */}
      <View className="items-center justify-center py-6 border-b border-slate-50">
        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <Text className="text-slate-900 text-3xl font-black tracking-[4px] text-center">LEAGUE HUB</Text>
      </View>

      <ScrollView
        className="flex-1 bg-secondary"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
      >

        {/* Overview Row */}
        <View className="flex-row px-6 mb-4 gap-4">
          <StatsCard
            title="Teams"
            value={totalTeams}
            icon={Users}
            color="#2563eb"
            onPress={() => router.push('/(tabs)/match/table')}
            shouldAnimate={!isLoading}
          />
          <StatsCard
            title="Players"
            value={totalPlayers}
            icon={User}
            color="#2563eb"
            onPress={() => router.push('/(tabs)/match/table')}
            shouldAnimate={!isLoading}
          />
        </View>

        {/* Hero Section: Latest Match */}
        <View className="px-6 mb-8 mt-6">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/match')}
            className="overflow-hidden relative rounded-3xl shadow-lg shadow-blue-500/20"
          >
            {/* Gradient Background */}
            <View className="absolute inset-0 bg-blue-600" />
            {/* Decorative Circles */}
            <View className="absolute top-[-50] right-[-50] w-64 h-64 bg-blue-500 rounded-full opacity-50" />
            <View className="absolute bottom-[-20] left-[-20] w-32 h-32 bg-indigo-600 rounded-full opacity-50" />

            <View className="p-6">
              <View className="flex-row justify-between items-center mb-6">
                <View className="bg-blue-800/50 px-3 py-1 rounded-full backdrop-blur-md border border-blue-400/30">
                  <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Matchday Report</Text>
                </View>
                {currentMatch && (
                  <Text className="text-blue-100 text-[10px] font-medium uppercase tracking-widest">
                    {new Date(currentMatch.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </Text>
                )}
              </View>

              {currentMatch ? (
                <View>
                  <View className="flex-row justify-between items-center">
                    {/* Home Team */}
                    <View className="items-center flex-1">
                      <Text className="text-xl font-black text-white text-center leading-6" numberOfLines={2}>
                        {getTeamName(currentMatch.homeTeamId)}
                      </Text>
                    </View>

                    {/* Score */}
                    <View className="items-center px-4">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-6xl font-black text-white tracking-tighter">
                          {currentMatch.homeScore}
                        </Text>
                        <View className="w-5 h-[3px] bg-white/20 mx-4" />
                        <Text className="text-6xl font-black text-white tracking-tighter">
                          {currentMatch.awayScore}
                        </Text>
                      </View>
                      <View className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/20">
                        <Text className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                          {currentMatch.isFinished ? 'Full Time' : 'Live'}
                        </Text>
                      </View>
                    </View>

                    {/* Away Team */}
                    <View className="items-center flex-1">
                      <Text className="text-xl font-black text-white text-center leading-6" numberOfLines={2}>
                        {getTeamName(currentMatch.awayTeamId)}
                      </Text>
                    </View>
                  </View>


                </View>
              ) : (
                <View className="py-8 items-center justify-center">
                  <View className="w-16 h-16 bg-white/10 rounded-full items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                    <Calendar size={32} color="white" />
                  </View>
                  <Text className="text-white font-bold text-lg mb-1">No Matches Found</Text>
                  <Text className="text-blue-100 text-xs">There are no match records for this season yet.</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Performance Grid */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-end mb-4 px-1">
            <Text className="text-slate-900 text-lg font-black tracking-tight">Top Performers</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/match/stats')} className="flex-row items-center">
              <Text className="text-blue-500 text-xs font-bold mr-1">See All</Text>
              <ChevronRight size={14} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-4">
            {/* Top Scorer */}
            <View className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200 relative overflow-hidden">
              <View className="flex-row justify-between items-start mb-4">
                <View className="w-10 h-10 rounded-xl items-center justify-center bg-amber-50">
                  <Trophy size={18} color="#d97706" />
                </View>
                <Text className="text-amber-600/50 text-[10px] font-black uppercase tracking-widest">Goals</Text>
              </View>

              <Text className="text-lg font-black text-slate-900 mb-1" numberOfLines={1}>
                {topScorerData ? topScorerData.player.name : '—'}
                {topScorerData?.extraCount ? `+` : ''}
              </Text>

              <View className="flex-row items-center mt-2">
                <CountingText
                  value={topScorerData?.player.goals || 0}
                  shouldAnimate={!isLoading}
                  className="text-3xl font-black text-slate-900 tracking-tighter"
                />
              </View>
            </View>

            {/* Top Assister */}
            <View className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200 relative overflow-hidden">
              <View className="flex-row justify-between items-start mb-4">
                <View className="w-10 h-10 rounded-xl items-center justify-center bg-indigo-50">
                  <Users size={18} color="#4f46e5" />
                </View>
                <Text className="text-indigo-600/50 text-[10px] font-black uppercase tracking-widest">Assists</Text>
              </View>

              <Text className="text-lg font-black text-slate-900 mb-1" numberOfLines={1}>
                {topAssisterData ? topAssisterData.player.name : '—'}
                {topAssisterData?.extraCount ? `+` : ''}
              </Text>

              <View className="flex-row items-center mt-2">
                <CountingText
                  value={topAssisterData?.player.assists || 0}
                  shouldAnimate={!isLoading}
                  className="text-3xl font-black text-slate-900 tracking-tighter"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Standings Chart */}
        <View className="px-6">
          <View className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200">
            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row items-center">
                <View className="bg-slate-50 p-2 rounded-xl mr-3">
                  <TrendingUp size={16} color="#0f172a" />
                </View>
                <Text className="text-slate-900 text-sm font-bold uppercase tracking-widest">Standings</Text>
              </View>
              <View className="bg-slate-50 px-3 py-1 rounded-full">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</Text>
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
                <Text className="text-[9px] font-bold text-slate-300 uppercase tracking-[3px]">Total Points</Text>
              </View>

              <View className="ml-4 w-full">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="w-[100vw]">
                    <BarChart
                      data={chartData}
                      width={Math.max(300, chartData.length * 35)}
                      noOfSections={4}
                      height={180}
                      barWidth={20}
                      barBorderTopRightRadius={4}
                      barBorderTopLeftRadius={4}
                      barBorderBottomLeftRadius={0}
                      barBorderBottomRightRadius={0}
                      yAxisThickness={0}
                      xAxisThickness={1}
                      yAxisColor="#fff"
                      xAxisColor="#e2e8f0"
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
                            <View className="bg-slate-50 px-3 py-0.5 rounded-full">
                              <Text className="text-[9px] font-bold text-slate-400 tracking-widest">{year}</Text>
                            </View>
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

      <ConfirmationModal
        visible={seasonAlertVisible}
        title="Action Required"
        message={`No season found for ${new Date().getFullYear()}. Please create one in Admin to start managing your league.`}
        confirmText="Go to Admin"
        cancelText="Later"
        onConfirm={() => {
          setSeasonAlertVisible(false);
          router.push('/admin/seasons');
        }}
        onCancel={() => setSeasonAlertVisible(false)}
        type="info"
      />
    </SafeAreaView>
  );
}
