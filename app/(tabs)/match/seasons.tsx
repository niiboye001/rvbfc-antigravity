import { router } from 'expo-router';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';
import { useLeague } from '../../../context/LeagueContext';
import { Season } from '../../../types';

export default function SeasonsScreen() {
    const { seasons } = useLeague();
    const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

    // Group seasons by year
    const allSections = seasons.reduce((acc: { title: string; data: Season[] }[], season) => {
        const yearTitle = `Year ${season.year}`;
        const existingSection = acc.find(s => s.title === yearTitle);
        if (existingSection) {
            existingSection.data.push(season);
        } else {
            acc.push({ title: yearTitle, data: [season] });
        }
        return acc;
    }, []).sort((a, b) => parseInt(b.title.split(' ')[1]) - parseInt(a.title.split(' ')[1])); // Newest year first



    const toggleSection = (title: string) => {
        setExpandedYears(prev => {
            const next = new Set(prev);
            if (next.has(title)) {
                next.delete(title);
            } else {
                next.add(title);
            }
            return next;
        });
    };

    // Filter data based on expansion
    const sections = allSections.map(section => ({
        ...section,
        data: expandedYears.has(section.title) ? section.data : []
    }));

    return (
        <View className="flex-1 bg-secondary">
            <SectionList
                sections={sections}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24 }}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section: { title } }) => {
                    const isExpanded = expandedYears.has(title);
                    return (
                        <TouchableOpacity
                            onPress={() => toggleSection(title)}
                            activeOpacity={0.7}
                            className={`flex-row justify-between items-center p-5 bg-white border-x border-t border-slate-100 shadow-sm shadow-slate-200 mt-4 ${isExpanded ? 'rounded-t-[24px] border-b-0' : 'rounded-[24px] border-b'}`}
                        >
                            <View className="flex-row items-center">
                                <View className="w-1 h-4 bg-primary rounded-full mr-3" />
                                <Text className="text-slate-900 font-black text-base uppercase tracking-widest">{title}</Text>
                            </View>
                            <View className={`p-2 rounded-full ${isExpanded ? 'bg-slate-50' : 'bg-slate-50'}`}>
                                {isExpanded ? <ChevronUp size={16} color="#0f172a" /> : <ChevronDown size={16} color="#64748b" />}
                            </View>
                        </TouchableOpacity>
                    );
                }}
                renderItem={({ item, section, index }) => {
                    const isLastItem = index === section.data.length - 1;
                    return (
                        <View className={`bg-white px-3 pb-2 border-x border-slate-100 shadow-sm shadow-slate-200 ${isLastItem ? 'rounded-b-[24px] border-b pb-4' : ''}`}>
                            <TouchableOpacity
                                onPress={() => router.push(`/season/${item.id}`)}
                                activeOpacity={0.7}
                                className="bg-slate-50 p-4 rounded-2xl flex-row justify-between items-center border border-slate-100"
                            >
                                <View className="flex-row items-center">

                                    <View>
                                        <Text className="font-black text-slate-900 text-lg">
                                            {item.name.replace(new RegExp(`${item.year}\\s*|\\s*${item.year}`, 'g'), '').trim() || 'Season'}
                                        </Text>
                                        <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tap to view details</Text>
                                    </View>
                                </View>
                                <ChevronDown size={16} color="#cbd5e1" style={{ transform: [{ rotate: '-90deg' }] }} />
                            </TouchableOpacity>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View className="items-center py-20">
                        <Text className="text-slate-300 font-black text-lg">No season history</Text>
                    </View>
                }
            />
        </View>
    );
}
