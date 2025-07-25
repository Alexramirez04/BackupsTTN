import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    padding: 24,
    paddingBottom: 48,
    gap: 24,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textGroup: {
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadgeContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  exportButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  noteInput: {
    backgroundColor: '#ffffff',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: '#111827',
    minHeight: 60,
    marginBottom: 10,
    fontSize: 14,
  },
  noteSaveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  noteSaveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
