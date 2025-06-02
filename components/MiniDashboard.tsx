import { View, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  total: number;
  activos: number;
  inactivos: number;
};

export default function MiniDashboard({ total, activos, inactivos }: Props) {
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.card}>
      <Text style={styles.title}>📊 Resumen</Text>

      <View style={styles.row}>
        {/* TOTAL */}
        <Animated.View entering={ZoomIn.delay(100)} style={styles.box}>
          <MaterialCommunityIcons name="counter" size={24} color="#60A5FA" />
          <Text style={styles.value}>{total}</Text>
          <Text style={styles.label}>Total</Text>
        </Animated.View>

        {/* ACTIVOS */}
        <Animated.View entering={ZoomIn.delay(200)} style={styles.box}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
          <Text style={[styles.value, { color: '#4CAF50' }]}>{activos}</Text>
          <Text style={[styles.label, { color: '#4CAF50' }]}>Activos</Text>
        </Animated.View>

        {/* INACTIVOS */}
        <Animated.View entering={ZoomIn.delay(300)} style={styles.box}>
          <MaterialCommunityIcons name="close-circle" size={24} color="#EF4444" />
          <Text style={[styles.value, { color: '#EF4444' }]}>{inactivos}</Text>
          <Text style={[styles.label, { color: '#EF4444' }]}>Inactivos</Text>
        </Animated.View>
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
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    width: 90,
    height: 90,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#60A5FA',
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 2,
  },
});
