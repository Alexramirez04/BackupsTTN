import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1e", // fondo general oscuro
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
  noDataText: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    fontStyle: "italic",
  }
});
