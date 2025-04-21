import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // 📦 Contenedor principal de toda la pantalla
  container: {
    flex: 1,
    backgroundColor: "#121212",     // fondo gris oscuro elegante
    paddingTop: 20,                 // separación superior (respeta notch)
    paddingHorizontal: 16,          // margen lateral izquierdo/derecho
  },

  // 🧱 Contenedor interno que organiza todos los bloques dentro de la pantalla
  inner: {
    flex: 1,
    gap: 16,                        // espacio vertical entre bloques (ej. consola y botones)
  },

  // 🏷️ Título "Live Data"
  title: {
    fontSize: 26,                   // tamaño grande para destacar
    fontWeight: "bold",             // negrita
    color: "#ffffff",               // blanco
    marginBottom: 12,               // espacio debajo del título
    paddingHorizontal: 20,          // pequeño padding lateral para respiro visual
  },

  // 🧮 Contenedor de los botones (horizontal o multilinea)
  buttonRow: {
    flexDirection: "row",           // organiza los botones en fila
    flexWrap: "wrap",               // permite que pasen a otra línea si no caben
    gap: 10,                        // separación entre botones
    paddingVertical: 8,             // espacio arriba/abajo del grupo de botones
    paddingHorizontal: 10,          // margen interno lateral
  },

  // 🔘 Estilo individual de cada botón
  button: {
    backgroundColor: "#1f1f1f",     // gris oscuro suave
    paddingVertical: 12,            // altura del botón
    paddingHorizontal: 16,          // anchura del botón
    borderRadius: 12,               // esquinas redondeadas
    borderWidth: 1,                 // borde visible
    borderColor: "#333",            // gris medio, mismo estilo que consola
    alignItems: "center",           // centra el texto horizontalmente
  },

  // 🔤 Texto dentro del botón
  buttonText: {
    color: "#00f0ff",               // azul neón suave
    fontWeight: "600",              // seminegrita
    fontSize: 14,                   // tamaño del texto
  },
});

export default styles;
