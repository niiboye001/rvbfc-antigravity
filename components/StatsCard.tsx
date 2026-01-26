import * as Haptics from 'expo-haptics';
import { ArrowUpRight, LucideIcon } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { CountingText } from './CountingText';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
    onPress?: () => void;
    shouldAnimate?: boolean;
}

export default function StatsCard({ title, value, icon: Icon, color = '#3b82f6', onPress, shouldAnimate = true }: StatsCardProps) {
    const handlePress = () => {
        if (onPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        }
    };

    const numericValue = typeof value === 'number' ? value : parseInt(value as string, 10);
    const isNumber = !isNaN(numericValue);

    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={handlePress}
            className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-md shadow-slate-200 relative overflow-hidden"
        >
            <View className="flex-row justify-between items-start mb-4">
                <View className="w-10 h-10 rounded-xl items-center justify-center bg-blue-50">
                    <Icon size={18} color={color} />
                </View>
                <View className="bg-slate-50 px-2 py-1 rounded-md">
                    <ArrowUpRight size={10} color="#94a3b8" />
                </View>
            </View>

            <View className="mt-2">
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1" numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
                <View className="flex-row">
                    {isNumber ? (
                        <CountingText
                            value={numericValue}
                            shouldAnimate={shouldAnimate}
                            className="text-3xl font-black text-slate-900 tracking-tighter"
                        />
                    ) : (
                        <Text className="text-2xl font-black text-slate-900" numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
