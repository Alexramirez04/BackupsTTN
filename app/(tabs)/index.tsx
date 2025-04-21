import { Image, TextInput, TouchableOpacity, View, Alert, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { registerDevice } from '@/services/ttnApi';
import { styles } from '../../styles/index.styles';
import TTNStatusWidget from '@/components/TTNStatusWidget';

export default function HomeScreen() {
  const [deviceId, setDeviceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const user = await AsyncStorage.getItem('currentUser');
      if (!user) {
        router.replace('/auth');
      } else {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Oculta el toast automáticamente
  useEffect(() => {
    if (successToast) {
      const timeout = setTimeout(() => setSuccessToast(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [successToast]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
        <ActivityIndicator size="large" color="#00f0ff" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/ttnLogo2.jpg')}
          style={styles.reactLogo}
        />
      }
    >
      <Animated.View
        entering={FadeInUp.duration(500)}
        exiting={FadeOut.duration(200)}
        style={{ flex: 1 }}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={styles.titleText}>
            Registrar nuevo dispositivo
          </ThemedText>
        </ThemedView>

        <TTNStatusWidget />

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Introduce el Device ID"
            placeholderTextColor="#9CA3AF"
            value={deviceId}
            onChangeText={setDeviceId}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              if (!deviceId.trim()) {
                Alert.alert('Error', 'Por favor, introduce un Device ID válido');
                return;
              }

              try {
                await registerDevice(deviceId);
                setDeviceId('');
                setSuccessToast(true); // ✅ mostramos el toast animado
              } catch (err) {
                Alert.alert('Error', 'No se pudo registrar el dispositivo');
              }
            }}
          >
            <Text style={styles.buttonText}>Registrar dispositivo</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ✅ TOAST ANIMADO */}
      {successToast && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOut.duration(300)}
          style={{
            position: 'absolute',
            bottom: 40,
            alignSelf: 'center',
            backgroundColor: '#00c851',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            ✅ Dispositivo registrado
          </Text>
        </Animated.View>
      )}
    </ParallaxScrollView>
  );
}
