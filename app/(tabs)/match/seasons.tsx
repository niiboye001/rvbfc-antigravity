import { SectionList, Text, View } from 'react-native';
import { useLeague } from '../../../context/LeagueContext';
import { Season } from '../../../types';

export default function SeasonsScreen() {
    const { seasons } = useLeague();

    // Group seasons by year
    const sections = seasons.reduce((acc: { title: string; data: Season[] }[], season) => {
        const yearTitle = `Year ${season.year}`;
        const existingSection = acc.find(s => s.title === yearTitle);
        if (existingSection) {
            existingSection.data.push(season);
        } else {
            acc.push({ title: yearTitle, data: [season] });
        }
        return acc;
    }, []).sort((a, b) => parseInt(b.title.split(' ')[1]) - parseInt(a.title.split(' ')[1])); // Newest year first

    return (
        <View className="flex-1 bg-secondary">
            <SectionList
                sections={sections}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24 }}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section: { title } }) => (
                    <View className="mb-4 mt-2">
                        <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest">{title}</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View className="bg-white p-6 rounded-2xl mb-4 border border-slate-50 relative overflow-hidden shadow-sm shadow-slate-200">
                        <View className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[60px]" />
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-2xl font-black text-slate-900">
                                    {item.name.replace(new RegExp(`${item.year}\\s*|\\s*${item.year}`, 'g'), '').trim() || 'Season'}
                                </Text>
                            </View>
                            {/* Optional: Indicator or just Keep it clean since Year is header */}
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center py-20">
                        <Text className="text-slate-300 font-black text-lg">No season history</Text>
                    </View>
                }
            />
        </View>
    );
}
