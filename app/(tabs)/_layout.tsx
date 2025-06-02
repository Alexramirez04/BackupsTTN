import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDark ? '#1c1c1e' : colors.background,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
          shadowColor: colors.shadow,
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          elevation: 8,
          // Efecto de cristal en iOS
          ...(Platform.OS === 'ios' && {
            backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            position: 'absolute',
            backdropFilter: 'blur(10px)',
          }),
        },
        tabBarItemStyle: {
          marginVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="aplicaciones"
        options={{
          title: 'Aplicaciones',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 4,
              borderRadius: 8,
              backgroundColor: focused ? `${color}20` : 'transparent',
            }}>
              <FontAwesome5 name="layer-group" size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              padding: 4,
              borderRadius: 8,
              backgroundColor: focused ? `${color}20` : 'transparent',
            }}>
              <Ionicons name="settings" size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}


