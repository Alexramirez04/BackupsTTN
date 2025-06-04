import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSequence,
  withSpring,
  Easing
} from 'react-native-reanimated';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  size = 'medium'
}) => {
  const { isDark, toggleTheme, colors } = useTheme();

  // Valores compartidos para animaciones
  const rotation = useSharedValue(isDark ? 40 : 0);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Actualizar valores cuando cambia el tema
  useEffect(() => {
    rotation.value = withTiming(isDark ? 40 : 0, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });

    // Animación de rebote
    scale.value = withSequence(
      withTiming(0.8, { duration: 150 }),
      withSpring(1, {
        damping: 8,
        stiffness: 100
      })
    );

    // Animación de flotación
    translateY.value = withSequence(
      withTiming(-5, { duration: 150 }),
      withTiming(0, { duration: 300 })
    );

    // Animación de opacidad
    opacity.value = withSequence(
      withTiming(0.7, { duration: 150 }),
      withTiming(1, { duration: 300 })
    );
  }, [isDark]);

  // Determinar el tamaño del icono según la prop size
  const getIconSize = () => {
    switch (size) {
      case 'small': return 18;
      case 'large': return 28;
      default: return 24;
    }
  };

  // Estilo animado para el icono
  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value
    };
  });

  // Estilo animado para el contenedor
  const containerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: isDark
        ? withTiming(colors.card, { duration: 300 })
        : withTiming(colors.background, { duration: 300 }),
      borderColor: isDark
        ? withTiming(colors.border, { duration: 300 })
        : withTiming(colors.border, { duration: 300 }),
    };
  });

  // Estilo animado para el texto
  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 300 }),
      transform: [
        { translateX: withTiming(0, { duration: 300 }) }
      ]
    };
  });

  // Texto a mostrar (con ancho fijo)
  const modeText = isDark ? "Oscuro" : "Claro";

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle
      ]}
    >
      <TouchableOpacity
        onPress={toggleTheme}
        style={styles.button}
        activeOpacity={0.7}
      >
        <Animated.View style={iconStyle}>
          <MaterialCommunityIcons
            name={isDark ? 'weather-night' : 'white-balance-sunny'}
            size={getIconSize()}
            color={isDark ? '#FFC107' : '#FF9800'}
          />
        </Animated.View>

        {showLabel && (
          <View style={styles.labelContainer}>
            <Animated.Text style={[styles.label, { color: colors.text }, textStyle]}>
              Modo {modeText}
            </Animated.Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  labelContainer: {
    width: 90, // Ancho fijo para evitar desplazamientos
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  }
});

export default ThemeToggle;
