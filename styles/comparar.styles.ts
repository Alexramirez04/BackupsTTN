import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const compararStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 4,
  },
  picker: {
    backgroundColor: '#2c2c2e',
    color: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  chart: {
    borderRadius: 16,
    marginBottom: 28,
  },
});
