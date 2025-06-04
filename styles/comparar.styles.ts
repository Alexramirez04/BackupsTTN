import { StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export const compararStyles = () => {
  const { colors, isDark } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#00ffff' : colors.primary,
      textAlign: 'center',
      marginBottom: 20,
    },
    label: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 6,
      marginLeft: 4,
    },
    picker: {
      backgroundColor: colors.card,
      color: colors.text,
      borderRadius: 12,
      marginBottom: 16,
    },
    chartTitle: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
    },
    chart: {
      borderRadius: 16,
      marginBottom: 28,
    },
  });
};
