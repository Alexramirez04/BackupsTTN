import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type DeviceStatusBadgeProps = {
  status: string;
  lastSeen: string | null;
  size?: 'small' | 'medium' | 'large';
  compact?: boolean; // Modo compacto que solo muestra el estado sin la última señal
};

/**
 * Componente que muestra el estado de un dispositivo con un badge visual
 * y texto informativo sobre la última vez que se vio el dispositivo.
 */
export default function DeviceStatusBadge({
  status,
  lastSeen,
  size = 'medium',
  compact = false
}: DeviceStatusBadgeProps) {
  // Determinar si el dispositivo está activo
  const isActive = status === 'active';

  // Calcular tiempo desde la última conexión
  const getTimeAgo = () => {
    if (!lastSeen) return 'Nunca conectado';

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} días`;
  };

  // Determinar el icono según el estado
  const getIcon = () => {
    if (isActive) return 'signal';
    if (lastSeen) return 'signal-off';
    return 'help-circle-outline';
  };

  // Determinar el color según el estado
  const getColor = () => {
    if (isActive) return '#4CAF50';
    if (lastSeen) return '#FF9800';
    return '#F44336';
  };

  // Determinar el mensaje según el estado
  const getMessage = () => {
    if (isActive) return 'Conectado';
    if (lastSeen) return 'Desconectado';
    return 'Sin datos';
  };

  // Determinar el tamaño según la prop
  const getSize = () => {
    switch (size) {
      case 'small': return styles.small;
      case 'large': return styles.large;
      default: return styles.medium;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 28;
      default: return 22;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return styles.textSmall;
      case 'large': return styles.textLarge;
      default: return styles.textMedium;
    }
  };

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={[styles.badge, getSize(), { backgroundColor: `${getColor()}20` }]}>
        <MaterialCommunityIcons
          name={getIcon()}
          size={getIconSize()}
          color={getColor()}
        />
        <Text style={[styles.statusText, getTextSize(), { color: getColor() }]}>
          {getMessage()}
        </Text>
      </View>

      {/* Solo mostrar la última señal si no estamos en modo compacto */}
      {!compact && lastSeen && (
        <Text style={styles.timeText}>
          <Text style={styles.timeLabel}>Última señal: </Text>
          {getTimeAgo()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    width: '100%',
  },
  compactContainer: {
    width: 'auto',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  small: {
    paddingVertical: 2,
    gap: 4,
  },
  medium: {
    paddingVertical: 4,
    gap: 6,
  },
  large: {
    paddingVertical: 6,
    gap: 8,
  },
  statusText: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginLeft: 4,
    lineHeight: 16,
  },
  timeLabel: {
    fontWeight: '600',
    color: '#555',
  },
});
