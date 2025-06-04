import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useApplication } from '@/context/ApplicationContext';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function DevicesLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ applicationId: string, applicationName: string }>();
  const routeApplicationId = params.applicationId;
  const applicationName = params.applicationName;
  const { setApplicationId } = useApplication();

  // Log para depuración
  console.log('Layout - Params recibidos:', params);
  console.log('Layout - ID de aplicación de la ruta:', routeApplicationId);

  // Guardar el ID de la aplicación en el contexto
  useEffect(() => {
    if (routeApplicationId) {
      console.log(`Guardando ID de aplicación en el contexto: ${routeApplicationId}`);
      setApplicationId(String(routeApplicationId));
    }
  }, [routeApplicationId, setApplicationId]);

  // Título para mostrar en la barra de navegación
  const title = applicationName || routeApplicationId || 'Dispositivos';

  // Función para volver a la lista de aplicaciones
  const handleGoBack = () => {
    router.push('/(tabs)/aplicaciones');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitle: title,
        headerLeft: () => (
          <TouchableOpacity
            onPress={handleGoBack}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Registro',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dispositivos"
        options={{
          title: 'Dispositivos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hardware-chip-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live Data',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
