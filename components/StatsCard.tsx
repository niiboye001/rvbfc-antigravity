import * as Haptics from 'expo-haptics';
import { LucideIcon } from 'lucide-react-native';
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
            className="bg-white p-5 rounded-2xl flex-1 border border-slate-50"
        >
            <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: `${color}15` }}>
                <Icon size={20} color={color} />
            </View>
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</Text>
            <View className="flex-row">
                {isNumber ? (
                    <CountingText
                        value={numericValue}
                        shouldAnimate={shouldAnimate}
                        className="text-3xl font-black text-slate-900"
                    />
                ) : (
                    <Text className="text-3xl font-black text-slate-900">{value}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}
