import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: -20,
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
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
    gap: 12,
    marginBottom: 4,
  },
  statusBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    letterSpacing: 0.2,
    flex: 1,
    marginLeft: 4,
    flexShrink: 1,
  },
  lastSeenContainer: {
    marginTop: 2,
  },
  lastSeenText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  lastSeenLabel: {
    fontWeight: '600',
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
    fontSize: 16,
  },
});
