import { FlatList, Text, View } from 'react-native';
import { useLeague } from '../../../context/LeagueContext';

export default function SeasonsScreen() {
    const { seasons } = useLeague();

    return (
        <View className="flex-1 bg-secondary">
            <FlatList
                data={seasons}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24 }}
                renderItem={({ item }) => (
                    <View className="bg-white p-6 rounded-2xl mb-4 border border-slate-50 relative overflow-hidden">
                        <View className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[60px]" />
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-1">League Season</Text>
                                <Text className="text-2xl font-black text-slate-900">{item.name}</Text>
                            </View>
                            <View className="bg-slate-50 px-4 py-2 rounded-2xl">
                                <Text className="text-blue-500 font-black text-sm">{item.year}</Text>
                            </View>
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
