import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

interface ThemeTransitionProps {
  children: React.ReactNode;
}

/**
 * Componente que proporciona una transición suave entre temas
 */
export default function ThemeTransition({ children }: ThemeTransitionProps) {
  const { isDark, colors } = useTheme();
  
  // Valor compartido para la animación
  const backgroundColorProgress = useSharedValue(isDark ? 1 : 0);
  
  // Actualizar el valor cuando cambia el tema
  useEffect(() => {
    backgroundColorProgress.value = withTiming(
      isDark ? 1 : 0,
      {
        duration: 400,
        easing: Easing.inOut(Easing.ease),
      }
    );
  }, [isDark, backgroundColorProgress]);
  
  // Estilo animado para el fondo
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: `rgba(
        ${isDark ? '18, 18, 18' : '245, 247, 250'},
        ${backgroundColorProgress.value}
      )`,
    };
  });
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
