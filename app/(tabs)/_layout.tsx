import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import Foundation from '@expo/vector-icons/Foundation';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5cc6e0', // 🔵 azul activo
        tabBarInactiveTintColor: '#18181a', // gris azulado inactivo
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#1E3A8A', // azul oscuro de fondo
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 6,
          paddingTop: 4,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Registro',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="laptopcomputer.and.iphone" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dispositivos"
        options={{
          title: 'Dispositivos',
          tabBarIcon: ({ color }) => (
            <Foundation name="database" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: "Live Data",
          tabBarIcon: ({ color, size }) => <Ionicons name="terminal" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}


