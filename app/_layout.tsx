import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { ApplicationProvider } from '@/context/ApplicationContext';
import ThemeTransition from '@/components/ThemeTransition';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { isDark, colors } = useTheme();

  // Usar el tema adecuado según el modo oscuro/claro
  const navigationTheme = isDark ? DarkTheme : DefaultTheme;

  // Personalizar el tema de navegación con nuestros colores
  const customNavigationTheme = {
    ...navigationTheme,
    colors: {
      ...navigationTheme.colors,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <ThemeTransition>
      <NavigationThemeProvider value={customNavigationTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="devices" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationThemeProvider>
    </ThemeTransition>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <ApplicationProvider>
        <RootLayoutInner />
      </ApplicationProvider>
    </ThemeProvider>
  );
}

