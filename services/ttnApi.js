const BASE_URL = "https://eu1.cloud.thethings.network/api/v3";
const API_KEY = "Bearer NNSXS.SRWUH2SEOODOSN3U2W5HQF6YMWM2PBCF62HSXJQ.AXH5KOOEGMKGUPS7KQSCYJW76WGUHLL3DHH2TWOLRXIUS3QQRIHA";
const APP_ID = "app-de-pruebas";
const BACKEND_URL = "https://3e7c-90-167-167-242.ngrok-free.app";

// HEX Generator
export function generateRandomHex(length) {
  const chars = '0123456789ABCDEF';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 👉 REGISTRAR NUEVO DISPOSITIVO
export async function registerDevice(
  { deviceId, devEUI, joinEUI, appKey, lorawanVersion = "1.0.3", frequencyPlanId = "EU_863_870", regionalParametersVersion = "RP001-1.0.3-A" },
  addLog
) {
  addLog?.(`📦 Registrando dispositivo "${deviceId}" en TTN...`);

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
      lorawan_version: lorawanVersion,
      frequency_plan_id: frequencyPlanId,
      mac_settings: {},
      supports_join: true,
      regional_parameters_version: regionalParametersVersion
    }
  };

  const response = await fetch(`${BASE_URL}/applications/${APP_ID}/devices`, {
    method: "POST",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    addLog?.(`❌ Error al registrar: ${error.message}`);
    throw new Error(error.message || 'Error al registrar el dispositivo');
  }

  addLog?.(`✅ Dispositivo "${deviceId}" registrado correctamente`);
  return response.json();
}

// 👉 LISTA DE DISPOSITIVOS
export async function getDevices(addLog) {
  addLog?.("📡 Obteniendo lista de dispositivos...");
  console.log("🌍 getDevices ejecutado desde este entorno");

  const response = await fetch(`${BASE_URL}/applications/${APP_ID}/devices`, {
    method: "GET",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    addLog?.(`❌ Error al obtener dispositivos: ${error.message}`);
    throw new Error(error.message || 'Error al obtener los dispositivos');
  }

  const data = await response.json();
  const dispositivos = data.end_devices || [];

  const devicesWithStatus = await Promise.all(
    dispositivos.map(async (device) => {
      try {
        const estadoRes = await fetch(`${BACKEND_URL}/estado/${device.ids.device_id}`);
        const estado = await estadoRes.json();

        const lastSeenDate = estado.lastSeen ? new Date(estado.lastSeen) : null;
        console.log(`🧪 ${device.ids.device_id} → status: ${estado.status}, lastSeen: ${estado.lastSeen}`);

        return {
          ...device,
          status: estado.status === 'active' ? 'active' : 'inactive',
          lastSeen: lastSeenDate?.toISOString() || null,
          temperatura: estado.temperatura ?? null,
          humedad: estado.humedad ?? null
        };
      } catch (error) {
        console.warn(`⚠️ Error consultando estado de ${device.ids.device_id}`);
        return {
          ...device,
          status: 'inactive',
          lastSeen: null,
          temperatura: null,
          humedad: null
        };
      }
    })
  );

  return devicesWithStatus;
}

// 👉 DETALLES DE UN DISPOSITIVO
export async function getDeviceById(deviceId, addLog) {
  addLog?.(`🔍 Obteniendo info de "${deviceId}"...`);

  const response = await fetch(`${BASE_URL}/applications/${APP_ID}/devices/${deviceId}`, {
    method: 'GET',
    headers: {
      Authorization: API_KEY,
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
    const estadoRes = await fetch(`${BACKEND_URL}/estado/${deviceId}`);
    const estado = await estadoRes.json();

    return {
      ...data,
      status: estado.status === 'active' ? 'active' : 'inactive',
      lastSeen: estado.lastSeen || null,
      temperatura: estado.temperatura ?? null,
      humedad: estado.humedad ?? null,
    };
  } catch {
    return {
      ...data,
      status: 'inactive',
      lastSeen: null,
      temperatura: null,
      humedad: null,
    };
  }
}

// 👉 ELIMINAR UN DISPOSITIVO
export async function deleteDevice(deviceId, addLog) {
  addLog?.(`🗑️ Eliminando dispositivo "${deviceId}"...`);

  const response = await fetch(`${BASE_URL}/applications/${APP_ID}/devices/${deviceId}`, {
    method: "DELETE",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    addLog?.(`❌ Error al eliminar ${deviceId}: ${error.message}`);
    throw new Error(error.message || 'Error al eliminar el dispositivo');
  }

  addLog?.(`✅ Dispositivo "${deviceId}" eliminado`);
  return response.json();
}
