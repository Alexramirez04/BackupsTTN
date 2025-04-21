import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

export default function AjustesScreen() {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const colorScheme = useColorScheme();
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("currentUser");
    router.replace("/auth"); // Redirige al login
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        entering={FadeInUp.duration(500)}
        exiting={FadeOut.duration(200)}
        style={{ flex: 1 }}
      >
        <Text style={styles.title}>⚙️ Ajustes</Text>

        <View style={styles.settingItem}>
          <Text style={styles.label}>Tema Oscuro</Text>
          <Switch value={colorScheme === 'dark'} />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.label}>Notificaciones</Text>
          <Switch
            value={notifEnabled}
            onValueChange={setNotifEnabled}
          />
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <Text style={[styles.label, { color: "#e53935", fontWeight: "bold" }]}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.label}>Acerca de la App</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 18,
  },
});
