import * as SecureStore from 'expo-secure-store';
const BASE_URL = "https://eu1.cloud.thethings.network/api/v3";

// Intenta importar BACKEND_URL, si no existe, lo defino como null
let BACKEND_URL = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BACKEND_URL = require('../config/appConfig.new').BACKEND_URL;
} catch (e) {
  BACKEND_URL = null;
}

// LISTA DE DISPOSITIVOS
export async function getDevices(addLog, applicationId) {
  const apiKey = await SecureStore.getItemAsync('TTN_API_KEY');
  console.log('Obteniendo dispositivos para:', applicationId);
  console.log('API Key usada:', apiKey);
  if (!apiKey) throw new Error('No hay API Key guardada.');
  if (!applicationId) throw new Error("ID de aplicación no proporcionado");
  addLog?.(`📡 Obteniendo lista de dispositivos para aplicación "${applicationId}"...`);
  console.log(`🌍 getDevices ejecutado para aplicación "${applicationId}"`);

  const response = await fetch(`${BASE_URL}/applications/${applicationId}/devices`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error al obtener dispositivos:', error);
    addLog?.(`❌ Error al obtener dispositivos: ${JSON.stringify(error)}`);
    throw new Error(error.message || 'Error al obtener los dispositivos');
  } else {
    console.log('Dispositivos obtenidos correctamente de TTN');
  }

  const data = await response.json();
  const dispositivos = data.end_devices || [];

  console.log(`🔍 getDevices: Encontrados ${dispositivos.length} dispositivos en TTN para aplicación "${applicationId}"`);
  if (dispositivos.length > 0) {
    console.log(`🔍 getDevices: IDs de dispositivos:`, dispositivos.map(d => d.ids.device_id).join(', '));
  }

  const devicesWithStatus = await Promise.all(
    dispositivos.map(async (device) => {
      if (BACKEND_URL) {
        try {
          // Pasar el ID de la aplicación como parámetro de consulta
          const estadoRes = await fetch(`${BACKEND_URL}/estado/${device.ids.device_id}?applicationId=${applicationId}`);
          const estado = await estadoRes.json();

          const lastSeenDate = estado.lastSeen ? new Date(estado.lastSeen) : null;
          console.log(`🧪 ${device.ids.device_id} (app: ${applicationId}) → status: ${estado.status}, lastSeen: ${estado.lastSeen}`);

          return {
            ...device,
            status: estado.status === 'active' ? 'active' : 'inactive',
            lastSeen: lastSeenDate?.toISOString() || null,
            temperatura: estado.temperatura ?? null,
            humedad: estado.humedad ?? null,
            bateria: estado.bateria ?? null,
          };
        } catch (error) {
          console.warn(`⚠️ Error consultando estado de ${device.ids.device_id} (app: ${applicationId}):`, error);
          return {
            ...device,
            status: 'inactive',
            lastSeen: null,
            temperatura: null,
            humedad: null,
            bateria: null
          };
        }
      } else {
        // Si no hay BACKEND_URL, solo devuelve los datos de TTN
        return {
          ...device,
          status: 'unknown',
          lastSeen: null,
          temperatura: null,
          humedad: null,
          bateria: null
        };
      }
    })
  );

  console.log(`🔍 getDevices: Devolviendo ${devicesWithStatus.length} dispositivos con estado para aplicación "${applicationId}"`);
  return devicesWithStatus;
}


// DETALLES DE UN DISPOSITIVO
export async function getDeviceById(deviceId, addLog, applicationId) {
  const apiKey = await SecureStore.getItemAsync('TTN_API_KEY');
  if (!apiKey) throw new Error('No hay API Key guardada.');
  if (!applicationId) throw new Error("ID de aplicación no proporcionado");
  addLog?.(`🔍 Obteniendo info de "${deviceId}" en aplicación "${applicationId}"...`);

  const response = await fetch(`${BASE_URL}/applications/${applicationId}/devices/${deviceId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    addLog?.(`❌ Error al obtener ${deviceId}: ${error.message}`);
    throw new Error(error.message || 'Error al obtener el dispositivo');
  }

  const data = await response.json();

  try {
    // Pasar el ID de la aplicación como parámetro de consulta
    const estadoRes = await fetch(`${BACKEND_URL}/estado/${deviceId}?applicationId=${applicationId}`);
    const estado = await estadoRes.json();

    // Extraer los campos adicionales del dispositivo (asegurando compatibilidad)
    let lorawan_version = data.lorawan_version || "1.0.2";
    // Corregir la versión si es 1.0.3 (no compatible con TTN)
    if (lorawan_version === "1.0.3") {
      lorawan_version = "1.0.2";
      console.log("⚠️ Versión LoRaWAN 1.0.3 detectada, usando 1.0.2 para compatibilidad");
    }
    const frequency_plan_id = data.frequency_plan_id || "EU_863_870";
    const regional_parameters_version = data.regional_parameters_version || "RP001-1.0.2-A";

    // Extraer el join_eui y app_key
    const join_eui = data.ids?.join_eui || "";
    const app_key = data.root_keys?.app_key?.key || "";

    return {
      ...data,
      status: estado.status === 'active' ? 'active' : 'inactive',
      lastSeen: estado.lastSeen || null,
      temperatura: estado.temperatura ?? null,
      humedad: estado.humedad ?? null,
      // Añadir campos adicionales para facilitar la exportación
      join_eui,
      app_key,
      lorawan_version,
      frequency_plan_id,
      regional_parameters_version
    };
  } catch (error) {
    console.warn(`⚠️ Error consultando estado de ${deviceId} (app: ${applicationId}):`, error);
    // Extraer los campos adicionales del dispositivo (asegurando compatibilidad)
    let lorawan_version = data.lorawan_version || "1.0.2";
    // Corregir la versión si es 1.0.3 (no compatible con TTN)
    if (lorawan_version === "1.0.3") {
      lorawan_version = "1.0.2";
      console.log("⚠️ Versión LoRaWAN 1.0.3 detectada, usando 1.0.2 para compatibilidad");
    }
    const frequency_plan_id = data.frequency_plan_id || "EU_863_870";
    const regional_parameters_version = data.regional_parameters_version || "RP001-1.0.2-A";

    // Extraer el join_eui y app_key
    const join_eui = data.ids?.join_eui || "";
    const app_key = data.root_keys?.app_key?.key || "";

    return {
      ...data,
      status: 'inactive',
      lastSeen: null,
      temperatura: null,
      humedad: null,
      // Añadir campos adicionales para facilitar la exportación
      join_eui,
      app_key,
      lorawan_version,
      frequency_plan_id,
      regional_parameters_version
    };
  }
}

// ELIMINAR UN DISPOSITIVO
export async function deleteDevice(deviceId, addLog, applicationId) {
  const apiKey = await SecureStore.getItemAsync('TTN_API_KEY');
  if (!apiKey) throw new Error('No hay API Key guardada.');
  if (!applicationId) throw new Error("ID de aplicación no proporcionado");
  addLog?.(`�️ Eliminando dispositivo "${deviceId}" de aplicación "${applicationId}"...`);

  const response = await fetch(`${BASE_URL}/applications/${applicationId}/devices/${deviceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    addLog?.(`❌ Error al eliminar ${deviceId}: ${error.message}`);
    throw new Error(error.message || 'Error al eliminar el dispositivo');
  }

  addLog?.(`✅ Dispositivo "${deviceId}" eliminado de aplicación "${applicationId}"`);
  return response.json();
}
