import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function DevicesRedirectScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    // Redirigir a la pantalla de aplicaciones
    console.log("Redirigiendo a la pantalla de aplicaciones...");

    // Usar setTimeout para asegurarnos de que la redirección ocurra después de que el componente se monte
    setTimeout(() => {
      router.replace('/aplicaciones');
    }, 100);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ marginTop: 20, color: colors.text }}>
        Redirigiendo...
      </Text>
    </View>
  );
}
