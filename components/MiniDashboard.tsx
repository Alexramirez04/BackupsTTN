import { View, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  total: number;
  activos: number;
  inactivos: number;
};

export default function MiniDashboard({ total, activos, inactivos }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={styles.card}
    >
      <Text style={styles.title}>📊 Resumen</Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.value}>{total}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.label, { color: '#4CAF50' }]}>Activos</Text>
          <Text style={[styles.value, { color: '#4CAF50' }]}>{activos}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.label, { color: '#EF4444' }]}>Inactivos</Text>
          <Text style={[styles.value, { color: '#EF4444' }]}>{inactivos}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    color: '#93C5FD',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  label: {
    color: '#E0E7FF',
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#60A5FA',
  },
});
