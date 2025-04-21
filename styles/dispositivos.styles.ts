import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    fontWeight: '600',
  },
  searchInput: {
    height: 40,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  deviceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deviceName: {
    fontSize: 16,
    color: '#222',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
    fontSize: 16,
  },
});
