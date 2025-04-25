import React from "react";
import { View, Text } from "react-native";

type Props = {
  total: number;
  activos: number;
  inactivos: number;
  mediaTemp: string;
  mediaHumedad: string;
  ultimaActualizacion: Date | null;
};

export default function ResumenDiario({
  total,
  activos,
  inactivos,
  mediaTemp,
  mediaHumedad,
  ultimaActualizacion,
}: Props) {
  return (
    <View
      style={{
        backgroundColor: "#1c1c1e",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#00ffff",
        padding: 16,
        marginBottom: 16,
        marginTop: 16,
        gap: 8,
      }}
    >
      <Text style={{ color: "#00ffff", fontWeight: "bold", fontSize: 16 }}>
        📊 Resumen Diario
      </Text>
      <Text style={{ color: "#00ffff" }}>🌡 Temperatura media: {mediaTemp} °C</Text>
      <Text style={{ color: "#00ffff" }}>💧 Humedad media: {mediaHumedad} %</Text>
      <Text style={{ color: "#00ffff" }}>
        📶 Activos: {activos} / {total}
      </Text>
      <Text style={{ color: "#00ffff" }}>
        ⏱ Última actualización:{" "}
        {ultimaActualizacion
          ? new Date(ultimaActualizacion).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "No disponible"}
      </Text>
    </View>
  );
}
