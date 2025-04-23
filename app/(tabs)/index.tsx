import { Image, TextInput, TouchableOpacity, View, Alert, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { styles } from '../../styles/index.styles';
import TTNStatusWidget from '@/components/TTNStatusWidget';

export default function HomeScreen() {
  const [deviceId, setDeviceId] = useState('sensornumero1');
  const [devEUI, setDevEUI] = useState('24E124785D120669');
  const [joinEUI, setJoinEUI] = useState('6666666666666666');
  const [appKey, setAppKey] = useState('C4140BC8DCC79DFB041B7EEF8F4FF8E1');
  const [frequencyPlanId, setFrequencyPlanId] = useState('');
  const [lorawanVersion, setLorawanVersion] = useState('');
  const [regionalParamsVersion, setRegionalParamsVersion] = useState('');
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState(false);
  const router = useRouter();
  const BACKEND_URL = "https://ccd4-85-52-163-190.ngrok-free.app"; // Cambiar a la URL de tu backend (usando ngrok si es necesario)

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

  useEffect(() => {
    if (successToast) {
      const timeout = setTimeout(() => setSuccessToast(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [successToast]);

  const hexRegex = /^[0-9A-Fa-f\s]+$/;

  // Función para registrar el dispositivo
  const handleRegister = async () => {
    if (!deviceId || !devEUI || !joinEUI || !appKey) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }
  
    const devEUIclean = devEUI.replace(/\s/g, '');
    const joinEUIclean = joinEUI.replace(/\s/g, '');
    const appKeyClean = appKey.replace(/\s/g, '');
  
    if (
      !hexRegex.test(devEUI) || devEUIclean.length !== 16 ||
      !hexRegex.test(joinEUI) || joinEUIclean.length !== 16 ||
      !hexRegex.test(appKey) || appKeyClean.length !== 32
    ) {
      Alert.alert("Error", "Revisa el formato de DevEUI (16 HEX), JoinEUI (16 HEX), AppKey (32 HEX)");
      return;
    }
  
    try {
      console.log('📤 Enviando registro de dispositivo con los datos:', {
        deviceId,
        devEUI,
        joinEUI,
        appKey,
        frequencyPlanId,
        lorawanVersion,
        regionalParamsVersion
      });
  
      // Enviar la solicitud al backend para registrar el dispositivo
      const response = await fetch(`${BACKEND_URL}/registrar-dispositivo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, devEUI, joinEUI, appKey })
      });
  
      const data = await response.json();
      if (!response.ok) {
        console.log('❌ Error del servidor:', data);  // Agregar más información del error
        throw new Error(data.error || 'Error al registrar el dispositivo');
      }
  
      console.log('✅ Registro completo. Dispositivo creado en TTN.');
      setDeviceId('');
      setDevEUI('');
      setJoinEUI('');
      setAppKey('');
      setSuccessToast(true);
    } catch (err) {
      console.log('❌ Error al registrar dispositivo:', err);
      if (err instanceof Error) {
        Alert.alert('Error', err.message || 'No se pudo registrar el dispositivo');
      } else {
        Alert.alert('Error', 'Error desconocido al registrar el dispositivo');
      }
    }
  };
  

  // Mostrar el cargando mientras verificamos la sesión del usuario
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
          <TextInput placeholder="Device ID" placeholderTextColor="#9CA3AF" value={deviceId} onChangeText={setDeviceId} style={styles.input} />
          <TextInput placeholder="DevEUI (16 HEX)" placeholderTextColor="#9CA3AF" value={devEUI} onChangeText={setDevEUI} style={styles.input} />
          <TextInput placeholder="JoinEUI (16 HEX)" placeholderTextColor="#9CA3AF" value={joinEUI} onChangeText={setJoinEUI} style={styles.input} />
          <TextInput placeholder="AppKey (32 HEX)" placeholderTextColor="#9CA3AF" value={appKey} onChangeText={setAppKey} style={styles.input} />
          <TextInput placeholder="Frequency Plan ID" placeholderTextColor="#9CA3AF" value={frequencyPlanId} onChangeText={setFrequencyPlanId} style={styles.input} />
          <TextInput placeholder="LoRaWAN Version" placeholderTextColor="#9CA3AF" value={lorawanVersion} onChangeText={setLorawanVersion} style={styles.input} />
          <TextInput placeholder="Regional Params Version" placeholderTextColor="#9CA3AF" value={regionalParamsVersion} onChangeText={setRegionalParamsVersion} style={styles.input} />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrar dispositivo</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

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
