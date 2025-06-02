import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing
} from 'react-native-reanimated';

// Definir los tipos de tema
type ThemeType = 'light' | 'dark' | 'system';

// Definir los colores para cada tema
export const lightTheme = {
  background: '#F5F7FA',
  card: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#3B82F6',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  statusBar: 'dark',
  tabBar: '#FFFFFF',
  tabBarInactive: '#9CA3AF',
  tabBarActive: '#3B82F6',
  inputBackground: '#F9FAFB',
  inputBorder: '#D1D5DB',
  shadow: '#000000',
};

export const darkTheme = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#F3F4F6',
  textSecondary: '#9CA3AF',
  border: '#374151',
  primary: '#60A5FA',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  statusBar: 'light',
  tabBar: '#1E1E1E',
  tabBarInactive: '#6B7280',
  tabBarActive: '#60A5FA',
  inputBackground: '#272727',
  inputBorder: '#4B5563',
  shadow: '#000000',
};

// Definir el tipo para el contexto
interface ThemeContextType {
  theme: ThemeType;
  colors: typeof lightTheme;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

// Crear el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook personalizado para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

// Proveedor del tema
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para el tema actual
  const [theme, setThemeState] = useState<ThemeType>('system');

  // Obtener el esquema de colores del sistema
  const systemColorScheme = useColorScheme() || 'light';

  // Determinar si estamos en modo oscuro
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

  // Colores actuales basados en el tema
  const colors = isDark ? darkTheme : lightTheme;

  // Cargar el tema guardado al iniciar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error al cargar el tema:', error);
      }
    };

    loadTheme();
  }, []);

  // Función para cambiar el tema
  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error al guardar el tema:', error);
    }
  };

  // Función para alternar entre temas claro y oscuro
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
