import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  deviceId: string;
};

export default function HistorialSensor({ deviceId }: Props) {
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await fetch(`https://52c3-85-50-83-166.ngrok-free.app/historico/${deviceId}`);
        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error("Error al obtener historial", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [deviceId]);

  if (loading) {
    return <ActivityIndicator size="small" color="#00ffff" />;
  }

  if (!datos.length) {
    return <Text style={{ color: "#00ffff", marginTop: 10 }}>Sin historial disponible.</Text>;
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
