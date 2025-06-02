import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
  Alert
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { createApplication } from '@/services/applicationApi';

interface CreateApplicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateApplicationModal({ visible, onClose, onSuccess }: CreateApplicationModalProps) {
  const { colors } = useTheme();

  // Generar un ID único basado en la fecha y hora actual
  const generateUniqueId = () => {
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `app-${timestamp.toString(36)}-${randomStr}`;
  };

  const [applicationId, setApplicationId] = useState(generateUniqueId());
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    // Validar campos
    if (!applicationId.trim()) {
      setError('El ID de la aplicación es obligatorio');
      return;
    }

    // Validar formato del ID (solo letras minúsculas, números y guiones)
    const idRegex = /^[a-z0-9-]+$/;
    if (!idRegex.test(applicationId)) {
      setError('El ID solo puede contener letras minúsculas, números y guiones');
      return;
    }

    if (!name.trim()) {
      setError('El nombre de la aplicación es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createApplication({
        applicationId,
        name,
        description
      }, console.log);

      // Limpiar el formulario
      setApplicationId('');
      setName('');
      setDescription('');

      // Notificar éxito
      onSuccess();

      // Cerrar el modal
      onClose();
    } catch (err: any) {
      console.error('Error al crear aplicación:', err);

      // Mostrar un mensaje de error más amigable
      console.error('Error detallado:', err);
      const errorMessage = err?.message || 'Error al crear la aplicación';

      if (errorMessage.includes('id_taken') || errorMessage.includes('ID already taken')) {
        setError(
          "El ID de aplicación ya está en uso.\n\n" +
          "Por favor, elige un ID diferente e intenta nuevamente."
        );
      } else if (errorMessage.includes('no_user_rights') || errorMessage.includes('no rights for user')) {
        setError(
          "No se puede crear la aplicación debido a restricciones de permisos en TTN.\n\n" +
          "El usuario asociado a tu API key no tiene los derechos necesarios para crear aplicaciones, " +
          "aunque la API key tenga los permisos correctos.\n\n" +
          "Puedes usar el botón de abajo para crear la aplicación directamente en la consola web de TTN."
        );
      } else if (errorMessage.includes('Method Not Allowed')) {
        setError(
          "No se puede crear la aplicación debido a restricciones de la API de TTN.\n\n" +
          "El método utilizado no está permitido para esta operación. " +
          "Puedes usar el botón de abajo para crear la aplicación directamente en la consola web de TTN."
        );
      } else {
        setError(`${errorMessage}\n\nPuedes intentar crear la aplicación directamente en la consola web de TTN.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Limpiar el formulario
    setApplicationId(generateUniqueId()); // Generar un nuevo ID único
    setName('');
    setDescription('');
    setError(null);

    // Cerrar el modal
    onClose();
  };

  const openTTNConsole = () => {
    Alert.alert(
      "Crear aplicación en TTN",
      "Debido a restricciones de permisos, no podemos crear aplicaciones directamente desde la app. ¿Quieres abrir la consola web de TTN para crear una aplicación manualmente?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Abrir consola web",
          onPress: () => {
            Linking.openURL('https://eu1.cloud.thethings.network/console/applications/add');

            // Mostrar instrucciones adicionales
            setTimeout(() => {
              Alert.alert(
                "Instrucciones",
                "1. Crea la aplicación en la consola web de TTN\n2. Vuelve a esta app cuando termines\n3. Pulsa el botón 'Actualizar' en la lista de aplicaciones para ver la nueva aplicación",
                [{ text: "Entendido" }]
              );
            }, 1000);

            // Cerrar el modal actual
            handleCancel();
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      width: '85%',
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 5,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    errorText: {
      color: colors.error,
      marginTop: 16,
      marginBottom: 12,
      fontSize: 14,
      textAlign: 'center',
      backgroundColor: `${colors.error}10`,
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.error,
      lineHeight: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 20,
    },
    cancelButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      marginRight: 10,
    },
    cancelText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    createButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    createText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
      marginLeft: loading ? 8 : 0,
    },
    helperText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    webConsoleButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
    },
    webConsoleText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: 8,
    },
    errorContainer: {
      marginTop: 16,
      marginBottom: 12,
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.title}>Nueva Aplicación</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancel}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>ID de la Aplicación</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="app-id-ejemplo"
                placeholderTextColor={colors.textSecondary}
                value={applicationId}
                onChangeText={setApplicationId}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <ThemedText style={styles.helperText}>
                ID único generado automáticamente. Puedes modificarlo si lo deseas (solo letras minúsculas, números y guiones).
              </ThemedText>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Nombre</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Mi Aplicación"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Descripción (opcional)</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción de la aplicación..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>

                {/* Solo mostrar el botón de la consola web si no es un error de ID ya en uso */}
                {!error.includes('ID de aplicación ya está en uso') && (
                  <TouchableOpacity
                    style={styles.webConsoleButton}
                    onPress={openTTNConsole}
                    activeOpacity={0.8}
                  >
                    <FontAwesome5 name="external-link-alt" size={14} color={colors.primary} />
                    <ThemedText style={styles.webConsoleText}>Crear en la consola web de TTN</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={loading}
              >
                <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreate}
                disabled={loading}
              >
                {loading && <ActivityIndicator size="small" color="#fff" />}
                <ThemedText style={styles.createText}>
                  {loading ? 'Creando...' : 'Crear'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
