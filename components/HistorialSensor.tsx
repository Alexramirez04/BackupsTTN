import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BACKEND_URL } from '@/config/appConfig.new';

type Props = {
  deviceId: string;
  applicationId?: string;
};

export default function HistorialSensor({ deviceId, applicationId }: Props) {
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        // Construir la URL con el ID de la aplicación si está disponible
        const url = applicationId
          ? `${BACKEND_URL}/historico/${deviceId}?applicationId=${applicationId}`
          : `${BACKEND_URL}/historico/${deviceId}`;

        console.log(`Obteniendo historial para dispositivo ${deviceId}${applicationId ? ` de la aplicación ${applicationId}` : ''}`);

        const res = await fetch(url);
        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error("Error al obtener historial", err);
        // Mostrar un mensaje más descriptivo para depuración
        setDatos([]);
        // Si la respuesta no es JSON válido, intentar obtener el texto de la respuesta
        if (err instanceof SyntaxError && err.message.includes('JSON')) {
          try {
            // Usar la misma URL que arriba
            const url = applicationId
              ? `${BACKEND_URL}/historico/${deviceId}?applicationId=${applicationId}`
              : `${BACKEND_URL}/historico/${deviceId}`;

            const textResponse = await fetch(url).then(r => r.text());
            console.log("Respuesta no válida:", textResponse);
          } catch (textErr) {
            console.error("No se pudo obtener la respuesta como texto", textErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [deviceId, applicationId]);

  if (loading) {
    return <ActivityIndicator size="small" color="#00ffff" />;
  }

  if (!datos.length) {
    return (
      <View style={{ marginTop: 10 }}>
        <Text style={{ color: "#00ffff", marginBottom: 5 }}>Sin historial disponible.</Text>
        <Text style={{ color: "#aaa", fontSize: 12 }}>
          Asegúrate de que el backend esté funcionando correctamente.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
        <Text style={{
            color: '#000000',
            fontWeight: 'bold',
            fontSize: 18,
            textAlign: 'center',
            marginBottom: 20,
        }}>
            -------------- Historial --------------
</Text>

    {[...datos].reverse().map((d, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: 'center',
            gap: 8,
            backgroundColor: "#1c1c1e",
            padding: 10,
            borderRadius: 8,
            borderColor: "#00ffff",
            borderWidth: 1,
          }}
        >
          <MaterialCommunityIcons name="clock" size={20} color="#00ffff" />
          <Text style={{ color: "#00ffff", fontWeight: "bold" }}>
            {new Date(d.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>

          <MaterialCommunityIcons name="thermometer" size={20} color="#00ffff" style={{ marginLeft: 12 }} />
          <Text style={{ color: "#00ffff" }}>{d.temperatura} °C</Text>

          <MaterialCommunityIcons name="water-percent" size={20} color="#00ffff" style={{ marginLeft: 12 }} />
          <Text style={{ color: "#00ffff" }}>{d.humedad}%</Text>
        </View>
      ))}
    </View>
  );
}
