import * as Haptics from 'expo-haptics';
import { LucideIcon } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
    onPress?: () => void;
}

export default function StatsCard({ title, value, icon: Icon, color = '#3b82f6', onPress }: StatsCardProps) {
    const handlePress = () => {
        if (onPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={handlePress}
            className="bg-white p-4 rounded-xl border border-slate-100 flex-1 min-w-[150px]"
        >
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-slate-500 text-sm font-medium">{title}</Text>
                <Icon size={20} color={color} />
            </View>
            <Text className="text-2xl font-bold text-slate-800">{value}</Text>
        </TouchableOpacity>
    );
}
