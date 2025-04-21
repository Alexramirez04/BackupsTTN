import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "auth",
};

export const options = {
  headerShown: false,
};


export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await AsyncStorage.getItem("currentUser");
      if (session) {
        router.replace("/"); // Redirige a la app si ya hay sesión
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Completa todos los campos");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    try {
      const usersRaw = await AsyncStorage.getItem("users");
      const users = usersRaw ? JSON.parse(usersRaw) : [];

      if (isRegistering) {
        const exists = users.find((u: any) => u.email === cleanEmail);
        if (exists) return Alert.alert("El usuario ya existe");

        const newUser = { email: cleanEmail, password: cleanPassword };
        const newUsers = [...users, newUser];

        await AsyncStorage.setItem("users", JSON.stringify(newUsers));
        await AsyncStorage.setItem("currentUser", JSON.stringify({ email: cleanEmail }));
        setEmail("");
        setPassword("");
        router.replace("/");
      } else {
        const match = users.find(
          (u: any) => u.email === cleanEmail && u.password === cleanPassword
        );
        if (!match) return Alert.alert("Credenciales incorrectas");

        await AsyncStorage.setItem("currentUser", JSON.stringify({ email: cleanEmail }));
        setEmail("");
        setPassword("");
        router.replace("/");
      }
    } catch (error) {
      Alert.alert("Error al guardar/leer datos");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formWrapper}>
        <Text style={styles.title}>
          {isRegistering ? "Registro" : "Iniciar Sesión"}
        </Text>

        <TextInput
          placeholder="Correo"
          placeholderTextColor="#aaa"
          style={styles.input}
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          style={styles.input}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {isRegistering ? "Registrarse" : "Entrar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.switchText}>
            {isRegistering
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    paddingTop: 60,
    paddingBottom: 40,
  },
  formWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#00ffff",
    marginBottom: 36,
    textAlign: "center",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#00aaff",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#00cfff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  switchText: {
    color: "#888",
    marginTop: 28,
    fontSize: 14,
    textDecorationLine: "underline",
    textAlign: "center",
  },
});
