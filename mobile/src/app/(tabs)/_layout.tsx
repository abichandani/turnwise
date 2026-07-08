import { Redirect, Tabs } from 'expo-router';

import { TabBarIcon } from '@/components/ui';
import { BottomTabInset } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const { status } = useAuth();
  const theme = useTheme();

  if (status !== 'signedIn') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.accent,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.cardBorder,
          height: BottomTabInset,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon emoji="🏠" label="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="duties"
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon emoji="🧹" label="Duties" focused={focused} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ tabBarIcon: ({ focused }) => <TabBarIcon emoji="👤" label="Account" focused={focused} /> }}
      />
    </Tabs>
  );
}
