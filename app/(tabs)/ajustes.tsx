import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function AjustesScreen() {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const { isDark, colors, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync("TTN_API_KEY");
            router.replace("/"); // Redirige al login
          }
        }
      ]
    );
  };

  const openWebsite = () => {
    Linking.openURL('https://www.thethingsnetwork.org/');
  };

  const showAboutInfo = () => {
    Alert.alert(
      "TTN Device Manager",
      "Versión 1.0.0\n\nUna aplicación para gestionar dispositivos IoT conectados a The Things Network.",
      [
        { text: "OK" }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={FadeInUp.duration(500)}
        exiting={FadeOut.duration(200)}
        style={{ flex: 1 }}
      >
        <ThemedText
          type="title"
          style={[
            styles.title,
            { color: isDark ? '#00ffff' : colors.primary }
          ]}
        >
          ⚙️ Ajustes
        </ThemedText>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Sección de Apariencia */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="palette-outline" size={22} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Apariencia</ThemedText>
            </View>

            <View style={[styles.settingItem, { borderColor: colors.border }]}>
              <View style={styles.settingLabelContainer}>
                <MaterialCommunityIcons
                  name={isDark ? "weather-night" : "white-balance-sunny"}
                  size={20}
                  color={isDark ? "#FFC107" : "#FF9800"}
                  style={styles.settingIcon}
                />
                <ThemedText style={styles.label}>Tema</ThemedText>
              </View>
              <View style={styles.toggleContainer}>
                <ThemeToggle showLabel={true} />
              </View>
            </View>
          </View>

          {/* Sección de Notificaciones */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Notificaciones</ThemedText>
            </View>

            <View style={[styles.settingItem, { borderColor: colors.border }]}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="notifications" size={20} color={colors.textSecondary} style={styles.settingIcon} />
                <ThemedText style={styles.label}>Notificaciones push</ThemedText>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={notifEnabled ? colors.success : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Sección de Información */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="information-outline" size={22} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Información</ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.settingItem, { borderColor: colors.border }]}
              onPress={showAboutInfo}
            >
              <View style={styles.settingLabelContainer}>
                <MaterialCommunityIcons name="information" size={20} color={colors.textSecondary} style={styles.settingIcon} />
                <ThemedText style={styles.label}>Acerca de la App</ThemedText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, { borderColor: colors.border }]}
              onPress={openWebsite}
            >
              <View style={styles.settingLabelContainer}>
                <MaterialCommunityIcons name="web" size={20} color={colors.textSecondary} style={styles.settingIcon} />
                <ThemedText style={styles.label}>Sitio web de TTN</ThemedText>
              </View>
              <MaterialCommunityIcons name="open-in-new" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Sección de Cuenta */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="user-circle" size={20} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Cuenta</ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.settingItem, { borderColor: colors.border }]}
              onPress={handleLogout}
            >
              <View style={styles.settingLabelContainer}>
                <MaterialCommunityIcons name="logout" size={20} color={colors.error} style={styles.settingIcon} />
                <Text style={[styles.label, { color: colors.error }]}>
                  Cerrar sesión
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Versión de la app */}
          <View style={styles.versionContainer}>
            <ThemedText style={styles.versionText}>TTN Device Manager v1.0.0</ThemedText>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleContainer: {
    minWidth: 120, // Ancho fijo para evitar desplazamientos
    alignItems: 'flex-end',
  },
  settingIcon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.6,
  }
});
