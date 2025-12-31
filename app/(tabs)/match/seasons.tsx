import { FlatList, Text, View } from 'react-native';
import { useLeague } from '../../../context/LeagueContext';

export default function SeasonsScreen() {
    const { seasons } = useLeague();

    return (
        <View className="flex-1 bg-secondary p-4">
            <Text className="font-bold text-lg text-primary mb-4">Past Seasons</Text>
            <FlatList
                data={seasons}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View className="bg-white p-5 rounded-xl shadow-sm mb-3">
                        <Text className="font-bold text-slate-800 text-lg">{item.name}</Text>
                        <Text className="text-slate-500 text-base">Year: {item.year}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text className="text-center text-slate-400 text-base">No history available</Text>
                }
            />
        </View>
    );
}
