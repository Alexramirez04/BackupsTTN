import { StyleSheet, Dimensions, Platform } from "react-native";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1,
    backgroundColor: "#1c1c1e", // Mantener el color original
    marginTop: -20,
  },

  // Contenedor interno con mejor espaciado
  inner: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Contenido del ScrollView
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 100, // Espacio adicional al final para evitar que el contenido quede oculto por la barra de navegación
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#00ffff", // cian vibrante
    marginBottom: 8,
  },
  scrollContainer: {
    marginVertical: 10,
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  chart: {
    marginVertical: 12,
    borderRadius: 20,
    // ✅ eliminamos la sombra
    elevation: 0, // para Android
    shadowColor: "transparent", // para iOS
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  chartLine: {
    marginLeft: -30,
  },
  noDataText: {
    color: "#94A3B8", // Gris azulado
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },

  // Contenedor de botones de exportación
  exportButtonsContainer: {
    paddingBottom: 40,
    marginTop: 20,
    alignItems: "center",
  },

  // Botón de exportación
  exportButton: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    minWidth: 280,
    alignItems: 'center',

    // Sombra para efecto de elevación
    /*shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,*/
  },

  // Texto de botón de exportación
  exportButtonText: {
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // Botón de comparar
  compareButton: {
    backgroundColor: "#00ffff",
    borderColor: "#00ffff",
    borderWidth: 2,
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 12,
    marginHorizontal: 20,
  },

  // Texto del botón de comparar
  compareButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Overlay para dispositivos desconectados
  disconnectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },

  // Texto para dispositivos desconectados
  disconnectedText: {
    color: '#ffcc00',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  // Estilo para el contenedor cuando no hay datos suficientes
  noDataChart: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    height: 220,
    width: width - 40,
    borderRadius: 20,
  },

  // Estilo para el texto cuando no hay datos suficientes
  noDataChartText: {
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});
