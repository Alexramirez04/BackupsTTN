import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { getApplications } from '@/services/applicationApi';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { createAplicacionesStyles } from '@/styles/aplicaciones.styles';
import { CreateApplicationModal } from '@/components/CreateApplicationModal';
import { ApplicationDetailsModal } from '@/components/ApplicationDetailsModal';
import AnimatedCard from '@/components/AnimatedCard';
import Skeleton from '@/components/Skeleton';

// Funciones auxiliares para extraer información de las aplicaciones
const getApplicationName = (item: any): string => {
  // Intentar obtener el nombre de diferentes ubicaciones posibles
  if (item.name) {
    return item.name;
  }

  if (item.application && item.application.name) {
    return item.application.name;
  }

  return "Aplicación sin nombre";
};

const getApplicationId = (item: any): string => {
  // Intentar obtener el ID de diferentes ubicaciones posibles
  if (item.ids && item.ids.application_id) {
    return item.ids.application_id;
  }

  if (item.application && item.application.ids && item.application.ids.application_id) {
    return item.application.ids.application_id;
  }

  return "Desconocido";
};

const getApplicationDescription = (item: any): string | null => {
  // Intentar obtener la descripción de diferentes ubicaciones posibles
  if (item.description) {
    return item.description;
  }

  if (item.application && item.application.description) {
    return item.application.description;
  }

  return null;
};

export default function AplicacionesScreen() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const { colors } = useTheme();
  const styles = createAplicacionesStyles(colors);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const apps = await getApplications(console.log);
      setApplications(apps);
    } catch (err: any) {
      if (err?.message === 'No hay API Key guardada.') {
        setApplications([]);
        setError('Debes iniciar sesión para ver tus aplicaciones.');
      } else {
        setError(err?.message || 'Error al cargar las aplicaciones');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadApplications();
  };

  const handleCreateApplication = () => {
    setCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
  };

  const handleApplicationCreated = () => {
    // Recargar la lista de aplicaciones después de crear una nueva
    loadApplications();
  };

  const handleViewApplication = (applicationId: string) => {
    // Guardar el ID de la aplicación seleccionada
    setSelectedApplicationId(applicationId);
    // Mostrar el modal de detalles
    setDetailsModalVisible(true);
    // Registrar información para depuración
    console.log(`Mostrando detalles de aplicación con ID: ${applicationId}`);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedApplicationId(null);
  };

  const handleDeleteApplication = () => {
    // Recargar la lista de aplicaciones después de eliminar una
    loadApplications();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Aplicaciones</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <Skeleton width={220} height={28} style={{ marginBottom: 18 }} />
          <Skeleton width={300} height={18} style={{ marginBottom: 10 }} />
          <Skeleton width={260} height={18} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Aplicaciones</ThemedText>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateApplication}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <ThemedText style={styles.createButtonText}>Crear</ThemedText>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-circle" size={50} color={colors.error} style={{ marginBottom: 20, opacity: 0.8 }} />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadApplications}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.retryText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => getApplicationId(item) || Math.random().toString()}
          renderItem={({ item, index }) => (
            <AnimatedCard delay={index * 80}>
              <TouchableOpacity
                style={styles.applicationItem}
                onPress={() => handleViewApplication(getApplicationId(item))}
                activeOpacity={0.9}
              >
                <View style={styles.applicationInfo}>
                  {/* Mostrar solo el ID de la aplicación */}
                  <ThemedText style={styles.applicationName}>
                    {getApplicationId(item)}
                  </ThemedText>
                  {/* Mostrar la descripción si existe */}
                  {getApplicationDescription(item) && (
                    <ThemedText style={styles.applicationDescription} numberOfLines={2}>
                      {getApplicationDescription(item)}
                    </ThemedText>
                  )}
                </View>
                <View style={styles.chevronContainer}>
                  <ThemedText style={styles.chevron}>›</ThemedText>
                </View>
              </TouchableOpacity>
            </AnimatedCard>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5
                name="layer-group"
                size={70}
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
              <ThemedText style={styles.emptyText}>
                No hay aplicaciones disponibles
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Las aplicaciones son contenedores para tus dispositivos LoRaWAN.
                Crea una nueva aplicación para comenzar a gestionar tus dispositivos.
              </ThemedText>
              <TouchableOpacity
                style={styles.emptyCreateButton}
                onPress={handleCreateApplication}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <ThemedText style={styles.createButtonText}>Crear aplicación</ThemedText>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal para crear nueva aplicación */}
      <CreateApplicationModal
        visible={createModalVisible}
        onClose={handleCloseCreateModal}
        onSuccess={handleApplicationCreated}
      />

      {/* Modal para ver detalles de aplicación */}
      {selectedApplicationId && (
        <ApplicationDetailsModal
          visible={detailsModalVisible}
          onClose={handleCloseDetailsModal}
          applicationId={selectedApplicationId}
          onDelete={handleDeleteApplication}
        />
      )}
    </SafeAreaView>
  );
}
