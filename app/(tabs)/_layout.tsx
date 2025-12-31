import { Tabs } from 'expo-router';
import { LayoutDashboard, Settings, Swords } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a', // Navy Blue
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 5,
        },
        tabBarActiveTintColor: '#3b82f6', // Accent Blue
        tabBarInactiveTintColor: '#94a3b8', // Slate 400
        tabBarLabelStyle: {
          fontFamily: 'Inter_400Regular',
          fontSize: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: 'Match',
          tabBarIcon: ({ color }) => <Swords size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
