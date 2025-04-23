const BASE_URL = "https://eu1.cloud.thethings.network/api/v3";
const API_KEY = "Bearer NNSXS.SRWUH2SEOODOSN3U2W5HQF6YMWM2PBCF62HSXJQ.AXH5KOOEGMKGUPS7KQSCYJW76WGUHLL3DHH2TWOLRXIUS3QQRIHA";
const APP_ID = "app-de-pruebas";
const BACKEND_URL = "https://ccd4-85-52-163-190.ngrok-free.app";

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
  { deviceId, devEUI, joinEUI, appKey, frequencyPlanId, lorawanVersion, regionalParamsVersion },
  addLog
) {
  addLog?.(`📦 Registrando dispositivo "${deviceId}" en TTN...`);

  const payload = {
    end_device: {
      ids: {
        device_id: deviceId.toLowerCase(),
        dev_eui: devEUI.replace(/\s/g, '').toUpperCase(),
        join_eui: joinEUI.replace(/\s/g, '').toUpperCase()
      },
      join_server_address: "eu1.cloud.thethings.network",
      network_server_address: "eu1.cloud.thethings.network",
      application_server_address: "eu1.cloud.thethings.network",
      root_keys: {
        app_key: {
          key: appKey.replace(/\s/g, '').toUpperCase()
        }
      },
      lorawan_version: lorawanVersion, // ej: "1.0.3"
      frequency_plan_id: frequencyPlanId, // ej: "EU_863_870"
      regional_parameters_version: regionalParamsVersion, // ej: "RP001-1.0.3-A"
      supports_join: true,
      supports_class_b: false,
      supports_class_c: false,
      mac_settings: {
        resets_f_cnt: true,
        status_time_periodicity: "0s",
        supports_32_bit_f_cnt: true
      }
    }
  };

  console.log("📤 PAYLOAD REAL A TTN:", JSON.stringify(payload, null, 2)); // 💥 AÑADIDO AQUÍ

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
    addLog?.(`❌ Error al registrar: ${JSON.stringify(error)}`);
    throw new Error(error.message || 'Error al registrar el dispositivo');
  }

  addLog?.(`✅ Dispositivo "${deviceId}" registrado correctamente`);
  return response.json();
}



// 👉 LISTA DE DISPOSITIVOS
export async function getDevices(addLog) {
  addLog?.("📡 Obteniendo lista de dispositivos...");

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
        return {
          ...device,
          status: estado.status === 'active' ? 'active' : 'inactive',
        };
      } catch {
        return { ...device, status: 'inactive' };
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
      temperatura: estado.temperatura ?? null,
      humedad: estado.humedad ?? null,
    };
  } catch {
    return { ...data, status: 'inactive' };
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

export async function setPayloadFormatter(deviceId, addLog) {
  addLog?.(`⚙️ Configurando Payload Formatter para "${deviceId}"...`);

  const formatterCode = `
    function decodeUplink(input) {
      var res = Decoder(input.bytes, input.fPort);
      if (res.error) {
        return {
          errors: [res.error],
        };
      }
      return {
        data: res,
      };
    }

    function Decoder(bytes, port) {
      return milesight(bytes);
    }

    function milesight(bytes) {
      var decoded = {};
      for (var i = 0; i < bytes.length;) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        if (channel_id === 0x01 && channel_type === 0x75) {
          decoded.battery = bytes[i];
          i += 1;
        } else if (channel_id === 0x03 && channel_type === 0x67) {
          decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
          i += 2;
        } else if (channel_id === 0x04 && channel_type === 0x68) {
          decoded.humidity = bytes[i] / 2;
          i += 1;
        } else if (channel_id === 0x20 && channel_type === 0xce) {
          var point = {};
          point.timestamp = readUInt32LE(bytes.slice(i, i + 4));
          point.temperature = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
          point.humidity = bytes[i + 6] / 2;
          decoded.history = decoded.history || [];
          decoded.history.push(point);
          i += 7;
        } else {
          break;
        }
      }
      return decoded;
    }

    function readUInt16LE(bytes) {
      return (bytes[1] << 8) + bytes[0];
    }

    function readInt16LE(bytes) {
      var ref = readUInt16LE(bytes);
      return ref > 0x7fff ? ref - 0x10000 : ref;
    }

    function readUInt32LE(bytes) {
      return (
        (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0]
      ) >>> 0;
    }
`.trim();

  const response = await fetch(`${BASE_URL}/applications/${APP_ID}/devices/${deviceId}/formatters/uplink/javascript`, {
    method: "PUT",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      formatter: "javascript",
      payload: formatterCode
    })
  });

  if (!response.ok) {
    const error = await response.json();
    addLog?.(`❌ Error al configurar formatter: ${error.message}`);
    throw new Error(error.message || 'Error al configurar el payload formatter');
  }

  addLog?.(`✅ Formatter configurado correctamente`);
}

