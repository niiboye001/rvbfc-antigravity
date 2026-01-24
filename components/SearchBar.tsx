import { Search, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    debounceMs?: number;
    isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'Search...',
    debounceMs = 500,
    isLoading = false
}) => {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(query);
        }, debounceMs);

        return () => {
            clearTimeout(handler);
        };
    }, [query, debounceMs, onSearch]);

    return (
        <View className="flex-row items-center bg-white p-3 rounded-xl border border-slate-200 mb-4">
            <Search size={20} color="#94a3b8" />
            <TextInput
                className="flex-1 ml-2 font-medium text-slate-900"
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
            />
            {isLoading ? (
                <ActivityIndicator size="small" color="#3b82f6" />
            ) : query.length > 0 ? (
                <TouchableOpacity onPress={() => setQuery('')}>
                    <X size={20} color="#cbd5e1" />
                </TouchableOpacity>
            ) : null}
        </View>
    );
};
