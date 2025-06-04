import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { getApplicationById, deleteApplication } from '@/services/applicationApi';
import { useRouter } from 'expo-router';

interface ApplicationDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  applicationId: string;
  onDelete: () => void;
}

export function ApplicationDetailsModal({
  visible,
  onClose,
  applicationId,
  onDelete
}: ApplicationDetailsModalProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationDetails, setApplicationDetails] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (visible && applicationId) {
      loadApplicationDetails();
    }
  }, [visible, applicationId]);

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const details = await getApplicationById(applicationId, console.log);
      setApplicationDetails(details);
    } catch (err: any) {
      console.error('Error al cargar detalles de la aplicación:', err);
      setError(err?.message || 'Error al cargar los detalles de la aplicación');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = () => {
    Alert.alert(
      "Eliminar Aplicación",
      `¿Estás seguro de que deseas eliminar la aplicación "${applicationId}"? Esta acción no se puede deshacer.`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteApplication(applicationId, console.log);
      onDelete();
      onClose();
    } catch (err: any) {
      console.error('Error al eliminar la aplicación:', err);
      Alert.alert(
        "Error",
        `No se pudo eliminar la aplicación: ${err?.message || 'Error desconocido'}`
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleManageDevices = () => {
    // Cerrar el modal
    onClose();

    // Navegar directamente a la pantalla de dispositivos
    console.log(`Navegando a dispositivos para la aplicación: ${applicationId}`);

    // Asegurarnos de que el ID de la aplicación es una cadena
    const appId = String(applicationId);

    // Usar una ruta directa con el ID de la aplicación
    const route = `/devices/${appId}/dispositivos`;
    console.log(`Ruta de navegación: ${route}`);

    // Navegar directamente
    router.push(route);
  };

  const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: colors.card,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    closeButton: {
      padding: 5,
    },
    content: {
      padding: 16,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      color: colors.error,
      textAlign: 'center',
      marginTop: 10,
    },
    detailItem: {
      marginBottom: 16,
    },
    detailLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    deleteButton: {
      backgroundColor: colors.error,
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    deleteButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
    },
    manageDevicesButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 16,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    manageDevicesText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
    },
    scrollContent: {
      paddingBottom: 20,
    }
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <ThemedText style={styles.title}>Detalles de Aplicación</ThemedText>
            <View style={{ width: 34 }} />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText style={{ marginTop: 10 }}>Cargando detalles...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color={colors.error} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : (
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>ID de Aplicación</ThemedText>
                <ThemedText style={styles.detailValue}>{applicationId}</ThemedText>
              </View>

              {applicationDetails?.name && (
                <View style={styles.detailItem}>
                  <ThemedText style={styles.detailLabel}>Nombre</ThemedText>
                  <ThemedText style={styles.detailValue}>{applicationDetails.name}</ThemedText>
                </View>
              )}

              {applicationDetails?.description && (
                <View style={styles.detailItem}>
                  <ThemedText style={styles.detailLabel}>Descripción</ThemedText>
                  <ThemedText style={styles.detailValue}>{applicationDetails.description}</ThemedText>
                </View>
              )}

              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Fecha de Creación</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {applicationDetails?.created_at
                    ? new Date(applicationDetails.created_at).toLocaleString()
                    : 'No disponible'}
                </ThemedText>
              </View>

              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>Última Actualización</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {applicationDetails?.updated_at
                    ? new Date(applicationDetails.updated_at).toLocaleString()
                    : 'No disponible'}
                </ThemedText>
              </View>

              <TouchableOpacity
                style={styles.manageDevicesButton}
                onPress={handleManageDevices}
              >
                <Ionicons name="hardware-chip-outline" size={20} color="#fff" />
                <ThemedText style={styles.manageDevicesText}>
                  Gestionar Dispositivos
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteApplication}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                )}
                <ThemedText style={styles.deleteButtonText}>
                  {deleting ? 'Eliminando...' : 'Eliminar Aplicación'}
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
