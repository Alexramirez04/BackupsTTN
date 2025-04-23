import { Image, TextInput, TouchableOpacity, View, Alert, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

import * as DocumentPicker from 'expo-document-picker';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { registerDevice } from '@/services/ttnApi';
import { styles } from '../../styles/index.styles';
import TTNStatusWidget from '@/components/TTNStatusWidget';

export default function HomeScreen() {
  const [deviceId, setDeviceId] = useState('');
  const [devEUI, setDevEUI] = useState('');
  const [joinEUI, setJoinEUI] = useState('');
  const [appKey, setAppKey] = useState('');
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

  useEffect(() => {
    if (successToast) {
      const timeout = setTimeout(() => setSuccessToast(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [successToast]);

  const importarDesdeJSON = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
  
      if (res.canceled || !res.assets?.length) return;
  
      const file = res.assets[0];
      const response = await fetch(file.uri);
      const content = await response.text();
      const data = JSON.parse(content);
  
      if (data.deviceId && data.devEUI && data.joinEUI && data.appKey) {
        setDeviceId(data.deviceId);
        setDevEUI(data.devEUI);
        setJoinEUI(data.joinEUI);
        setAppKey(data.appKey);
        Alert.alert('✅ Dispositivo importado correctamente');
      } else {
        Alert.alert('Error', 'El archivo no contiene todos los campos necesarios.');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo importar el archivo.');
      console.error(err);
    }
  };  

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
            placeholder="Device ID"
            placeholderTextColor="#9CA3AF"
            value={deviceId}
            onChangeText={setDeviceId}
            style={styles.input}
          />
          <TextInput
            placeholder="DevEUI (16 caracteres HEX)"
            placeholderTextColor="#9CA3AF"
            value={devEUI}
            onChangeText={setDevEUI}
            style={styles.input}
          />
          <TextInput
            placeholder="JoinEUI (16 caracteres HEX)"
            placeholderTextColor="#9CA3AF"
            value={joinEUI}
            onChangeText={setJoinEUI}
            style={styles.input}
          />
          <TextInput
            placeholder="AppKey (32 caracteres HEX)"
            placeholderTextColor="#9CA3AF"
            value={appKey}
            onChangeText={setAppKey}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              if (!deviceId || !devEUI || !joinEUI || !appKey) {
                Alert.alert('Error', 'Por favor, completa todos los campos');
                return;
              }

              try {
                await registerDevice({ deviceId, devEUI, joinEUI, appKey });
                setDeviceId('');
                setDevEUI('');
                setJoinEUI('');
                setAppKey('');
                setSuccessToast(true);
              } catch (err) {
                Alert.alert('Error', 'No se pudo registrar el dispositivo');
              }
            }}
          >
            <Text style={styles.buttonText}>Registrar dispositivo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#444', marginTop: 10 }]}
            onPress={importarDesdeJSON}
          >
            <Text style={[styles.buttonText, { color: '#00ffff' }]}>
              📥 Importar desde JSON
            </Text>
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
