import { useState, useEffect } from 'react';
import { Alert, TextInput, TouchableOpacity, View, Text, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerMilesightEM320TH } from '@/services/ttnDeviceRegistration';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TTNStatusWidget from '@/components/TTNStatusWidget';
import { useApplication } from '@/context/ApplicationContext';
import { useTheme } from '@/context/ThemeContext';
import { styles } from '../../../styles/index.styles';

export default function HomeScreen() {
  const [deviceId, setDeviceId] = useState('');
  const [devEUI, setDevEUI] = useState('');
  const [joinEUI, setJoinEUI] = useState('');
  const [appKey, setAppKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams<{ applicationId: string }>();
  const routeApplicationId = params.applicationId;
  const { applicationId } = useApplication();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const checkSession = async () => {
      const user = await AsyncStorage.getItem('currentUser');
      if (!user) {
        setLoading(false);
        // router.replace('/auth');
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

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? '#111' : colors.background
      }}>
        <ActivityIndicator size="large" color={isDark ? "#00f0ff" : colors.primary} />
        <Text style={{ color: isDark ? '#fff' : colors.text, marginTop: 10 }}>
          Verificando sesión...
        </Text>
      </View>
    );
  }

  // Función para validar hexadecimales
  const isHex = (str: string, length: number) => {
    const regex = new RegExp(`^[0-9A-Fa-f]{${length}}$`);
    return regex.test(str);
  };

  // Validaciones extra para mostrar alertas
  const validateInputs = () => {
    if (!deviceId || !devEUI || !joinEUI || !appKey) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return false;
    }
    if (!isHex(devEUI, 16)) {
      Alert.alert('Error', 'DevEUI debe tener 16 caracteres hexadecimales');
      return false;
    }
    if (!isHex(joinEUI, 16)) {
      Alert.alert('Error', 'JoinEUI debe tener 16 caracteres hexadecimales');
      return false;
    }
    if (!isHex(appKey, 32)) {
      Alert.alert('Error', 'AppKey debe tener 32 caracteres hexadecimales');
      return false;
    }
    return true;
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image source={require('@/assets/images/ttnLogo2.jpg')} style={styles.reactLogo} />
      }
    >
      <Animated.View entering={FadeInUp.duration(500)} exiting={FadeOut.duration(200)} style={{ flex: 1 }}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={[styles.titleText, { color: isDark ? '#00ffff' : colors.primary }]}>
            Registrar dispositivo Milesight EM320-TH
          </ThemedText>
        </ThemedView>

        <TTNStatusWidget />

        <View style={[styles.formContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <TextInput
            placeholder="Device ID"
            placeholderTextColor={colors.textSecondary}
            value={deviceId}
            onChangeText={setDeviceId}
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            maxLength={32}
          />
          <TextInput
            placeholder="DevEUI (16 caracteres HEX)"
            placeholderTextColor={colors.textSecondary}
            value={devEUI}
            onChangeText={text => setDevEUI(text.toUpperCase())}
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            maxLength={16}
            autoCapitalize="characters"
          />
          <TextInput
            placeholder="JoinEUI (16 caracteres HEX)"
            placeholderTextColor={colors.textSecondary}
            value={joinEUI}
            onChangeText={text => setJoinEUI(text.toUpperCase())}
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            maxLength={16}
            autoCapitalize="characters"
          />
          <TextInput
            placeholder="AppKey (32 caracteres HEX)"
            placeholderTextColor={colors.textSecondary}
            value={appKey}
            onChangeText={text => setAppKey(text.toUpperCase())}
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            maxLength={32}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={async () => {
              if (!validateInputs()) return;

              const appId = applicationId || routeApplicationId;
              if (!appId) {
                Alert.alert('Error', 'No se proporcionó un ID de aplicación');
                return;
              }

              try {
                await registerMilesightEM320TH({
                  deviceId,
                  devEUI,
                  joinEUI,
                  appKey,
                  applicationId: String(appId)
                }, console.log);

                setDeviceId('');
                setDevEUI('');
                setJoinEUI('');
                setAppKey('');
                setSuccessToast(true);
              } catch (err) {
                console.error('Error al registrar dispositivo:', err);
                Alert.alert('Error', 'No se pudo registrar el dispositivo');
              }
            }}
          >
            <Text style={styles.buttonText}>Registrar Milesight EM320-TH</Text>
          </TouchableOpacity>
        </View>

        {successToast && (
          <Animated.View
            entering={FadeInUp.duration(300)}
            exiting={FadeOut.duration(300)}
            style={{
              position: 'absolute',
              bottom: 40,
              alignSelf: 'center',
              backgroundColor: colors.success,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 20,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.5 : 0.3,
              shadowRadius: 6,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              ✅ Dispositivo registrado
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </ParallaxScrollView>
  );
}
