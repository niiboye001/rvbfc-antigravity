import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    TEAMS: 'oneness_teams',
    PLAYERS: 'oneness_players',
    MATCHES: 'oneness_matches',
    SEASONS: 'oneness_seasons',
};

export const storage = {
    async saveData(key: string, data: any) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save data', e);
        }
    },

    async loadData(key: string) {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Failed to load data', e);
            return null;
        }
    },

    KEYS,
};
