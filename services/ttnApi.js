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

// HEX Generator
export function generateRandomHex(length) {
  const chars = '0123456789ABCDEF';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// REGISTRAR NUEVO DISPOSITIVO
export async function registerDevice(
  { deviceId, devEUI, joinEUI, appKey, lorawanVersion = "1.0.3", frequencyPlanId = "EU_863_870", regionalParametersVersion = "RP001-1.0.3-A", applicationId },
  addLog
) {
  const apiKey = await SecureStore.getItemAsync('TTN_API_KEY');
  if (!apiKey) throw new Error('No hay API Key guardada.');
  if (!applicationId) throw new Error("ID de aplicación no proporcionado");
  addLog?.(`📦 Registrando dispositivo "${deviceId}" en aplicación "${applicationId}"...`);

  // Log para depuración
  console.log(`📦 Registrando dispositivo con parámetros:`, {
    deviceId,
    devEUI,
    joinEUI,
    appKey,
    lorawanVersion,
    frequencyPlanId,
    regionalParametersVersion,
    applicationId
  });

  // Asegurarse de que los valores sean correctos y compatibles con TTN
  // La versión 1.0.3 no es válida para TTN, usar 1.0.2 en su lugar
  const validLorawanVersion = lorawanVersion === "1.0.3" ? "1.0.2" : (lorawanVersion || "1.0.2");
  const validFrequencyPlanId = frequencyPlanId || "EU_863_870";
  const validRegionalParametersVersion = regionalParametersVersion || "RP001-1.0.2-A";

  const payload = {
    end_device: {
      ids: {
        device_id: deviceId.toLowerCase(),
        dev_eui: devEUI.toUpperCase(),
        join_eui: joinEUI.toUpperCase()
      },
      join_server_address: "eu1.cloud.thethings.network",
      network_server_address: "eu1.cloud.thethings.network",
      application_server_address: "eu1.cloud.thethings.network",
      root_keys: {
        app_key: {
          key: appKey.toUpperCase()
        }
      },
      lorawan_version: validLorawanVersion,
      frequency_plan_id: validFrequencyPlanId,
      mac_settings: {},
      supports_join: true,
      regional_parameters_version: validRegionalParametersVersion
    }
  };

  // Log del payload completo
  console.log(`📦 Payload enviado a TTN:`, JSON.stringify(payload, null, 2));

  const response = await fetch(`${BASE_URL}/applications/${applicationId}/devices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    console.log(`❌ Error al registrar dispositivo:`, error);
    addLog?.(`❌ Error al registrar: ${error.message}`);
    throw new Error(error.message || 'Error al registrar el dispositivo');
  }

  const responseData = await response.json();
  console.log(`✅ Respuesta de TTN:`, JSON.stringify(responseData, null, 2));

  // Verificar si los campos adicionales se han aplicado correctamente
  console.log(`📋 Verificando campos adicionales en la respuesta:`);
  console.log(`- lorawan_version: ${responseData.lorawan_version || 'N/A'}`);
  console.log(`- frequency_plan_id: ${responseData.frequency_plan_id || 'N/A'}`);
  console.log(`- regional_parameters_version: ${responseData.regional_parameters_version || 'N/A'}`);

  addLog?.(`✅ Dispositivo "${deviceId}" registrado correctamente en aplicación "${applicationId}"`);
  return responseData;
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
    console.log('Error al obtener dispositivos:', error);
    addLog?.(`❌ Error al obtener dispositivos: ${JSON.stringify(error)}`);
    throw new Error(error.message || 'Error al obtener los dispositivos');
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

// ACTUALIZAR UN DISPOSITIVO EXISTENTE
export async function updateDevice(
  { deviceId, lorawanVersion = "1.0.2", frequencyPlanId = "EU_863_870", regionalParametersVersion = "RP001-1.0.2-A", applicationId },
  addLog
) {
  const apiKey = await SecureStore.getItemAsync('TTN_API_KEY');
  if (!apiKey) throw new Error('No hay API Key guardada.');
  if (!applicationId) throw new Error("ID de aplicación no proporcionado");
  // Corregir la versión LoRaWAN si es 1.0.3 (no compatible con TTN)
  if (lorawanVersion === "1.0.3") {
    lorawanVersion = "1.0.2";
    console.log("⚠️ Versión LoRaWAN 1.0.3 no compatible con TTN, usando 1.0.2 en su lugar");
  }
  addLog?.(`🔄 Actualizando dispositivo "${deviceId}" en aplicación "${applicationId}"...`);

  console.log(`🔄 Actualizando dispositivo con parámetros:`, {
    deviceId,
    lorawanVersion,
    frequencyPlanId,
    regionalParametersVersion,
    applicationId
  });

  // Primero obtenemos el dispositivo actual para no perder configuración
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

  const currentDevice = await response.json();

  // Preparamos el payload con los datos actuales más los nuevos
  const payload = {
    end_device: {
      ...currentDevice,
      lorawan_version: lorawanVersion,
      frequency_plan_id: frequencyPlanId,
      regional_parameters_version: regionalParametersVersion
    }
  };

  console.log(`🔄 Payload para actualización:`, JSON.stringify(payload, null, 2));

  // Realizamos la actualización
  const updateResponse = await fetch(`${BASE_URL}/applications/${applicationId}/devices/${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!updateResponse.ok) {
    const error = await updateResponse.json();
    console.log(`❌ Error al actualizar dispositivo:`, error);
    addLog?.(`❌ Error al actualizar: ${error.message}`);
    throw new Error(error.message || 'Error al actualizar el dispositivo');
  }

  const responseData = await updateResponse.json();
  console.log(`✅ Respuesta de TTN (actualización):`, JSON.stringify(responseData, null, 2));

  // Verificar si los campos adicionales se han aplicado correctamente
  console.log(`📋 Verificando campos adicionales en la respuesta de actualización:`);
  console.log(`- lorawan_version: ${responseData.lorawan_version || 'N/A'}`);
  console.log(`- frequency_plan_id: ${responseData.frequency_plan_id || 'N/A'}`);
  console.log(`- regional_parameters_version: ${responseData.regional_parameters_version || 'N/A'}`);

  addLog?.(`✅ Dispositivo "${deviceId}" actualizado correctamente en aplicación "${applicationId}"`);
  return responseData;
}

// ELIMINAR UN DISPOSITIVO
export async function deleteDevice(deviceId, addLog, applicationId) {
  const apiKey = await SecureStore.getItemAsync('TTN_API_KEY');
  if (!apiKey) throw new Error('No hay API Key guardada.');
  if (!applicationId) throw new Error("ID de aplicación no proporcionado");
  addLog?.(`🗑️ Eliminando dispositivo "${deviceId}" de aplicación "${applicationId}"...`);

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
