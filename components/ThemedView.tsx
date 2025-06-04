import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface ThemedViewProps extends ViewProps {
  type?: 'default' | 'card' | 'elevated';
  lightColor?: string;
  darkColor?: string;
}

/**
 * Componente View que aplica automáticamente los colores del tema actual
 */
export function ThemedView({
  children,
  style,
  type = 'default',
  lightColor,
  darkColor,
  ...props
}: ThemedViewProps) {
  const { colors, isDark } = useTheme();

  // Determinar el color de fondo
  let backgroundColor = colors.background;

  // Si se proporcionan colores específicos, usarlos
  if (lightColor || darkColor) {
    backgroundColor = isDark ? (darkColor || colors.background) : (lightColor || colors.background);
  }

  // Determinar el estilo base según el tipo
  const getBaseStyle = () => {
    switch (type) {
      case 'card':
        return {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
        };
      case 'elevated':
        return {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 6,
          elevation: 3,
        };
      default:
        return {
          backgroundColor,
        };
    }
  };

  return (
    <View
      style={[getBaseStyle(), style]}
      {...props}
    >
      {children}
    </View>
  );
}
