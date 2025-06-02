import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Text, Alert, Image, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [inputKey, setInputKey] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const checkApiKey = async () => {
      const storedKey = await SecureStore.getItemAsync('TTN_API_KEY');
      if (storedKey) {
        setApiKey(storedKey);
        router.replace('/(tabs)/aplicaciones');
      } else {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start();
      }
    };
    checkApiKey();
  }, []);

  const handleLogin = async () => {
    if (!inputKey.startsWith('NNSXS.')) {
      Alert.alert('Error', 'Introduce una API Key válida de TTN (debe empezar por NNSXS.)');
      return;
    }
    await SecureStore.setItemAsync('TTN_API_KEY', inputKey);
    setApiKey(inputKey);
    router.replace('/(tabs)/aplicaciones');
  };

  if (loading) {
    return null;
  }

  return (
    <LinearGradient
      colors={[isDark ? '#232526' : '#6EE7B7', '#3B82F6', '#8B5CF6', '#EC4899']}
      style={styles.gradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] }]}> 
          <View style={styles.logoCircle}>
            <Image
              source={require('../assets/images/ttnLogo2.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>TTN Device Manager</Text>
          <Text style={styles.subtitle}>Gestiona tus dispositivos LoRaWAN de forma segura y visual</Text>
          <TextInput
            value={inputKey}
            onChangeText={setInputKey}
            placeholder="Introduce tu API Key de TTN"
            placeholderTextColor="#bdbdbd"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.version}>v1.0.0</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  card: {
    width: 350,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 54,
    height: 54,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    borderWidth: 0,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    padding: 16,
    fontSize: 17,
    color: '#222',
    marginBottom: 22,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  button: {
    width: '100%',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  version: {
    color: '#fff',
    fontSize: 13,
    marginTop: 38,
    opacity: 0.7,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
});
