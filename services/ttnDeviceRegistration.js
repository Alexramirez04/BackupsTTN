/**
 * Registrar dispositivo Milesight EM320-TH en TTN con decoder JS personalizado
 * y actualizar decoder.
 */

// Configuración de la API
const API_KEY = "Bearer NNSXS.6RL5W6LGZMWMTD4VGUO4YHBCWBW2FLZG7H5OHHQ.2FJ2MEIJCC3CAHJ2634NWKT5AI7ZITLPGPNS3J2GR5Q5ZPMUUHAQ";
const BASE_URL = "https://eu1.cloud.thethings.network/api/v3";

// Validaciones básicas
function isValidDeviceId(deviceId) {
  return /^[a-z0-9-]{2,36}$/i.test(deviceId);
}
function isValidEUI(eui) {
  return /^[0-9A-F]{16}$/i.test(eui);
}
function isValidAppKey(key) {
  return /^[0-9A-F]{32}$/i.test(key);
}

export async function registerMilesightEM320TH({
  deviceId,
  devEUI,
  joinEUI,
  appKey,
  lorawanVersion = "MAC_V1_0_3",
  lorawanPhyVersion = "PHY_V1_0_3_REV_A",
  frequencyPlanId = "EU_863_870",
  applicationId
}, addLog) {
  if (!isValidDeviceId(deviceId)) throw new Error("ID de dispositivo inválido");
  if (!isValidEUI(devEUI))       throw new Error("DevEUI inválido");
  if (!isValidEUI(joinEUI))      throw new Error("JoinEUI inválido");
  if (!isValidAppKey(appKey))    throw new Error("AppKey inválido");
  if (!applicationId)            throw new Error("ID de aplicación no proporcionado");

  addLog?.(`🔍 Iniciando registro del dispositivo "${deviceId}" en aplicación "${applicationId}"...`);
  console.log(`🔍 Iniciando registro del dispositivo "${deviceId}" en aplicación "${applicationId}"...`);
  console.log(`🔍 Parámetros de registro:`, {
    deviceId,
    devEUI,
    joinEUI,
    appKey,
    lorawanVersion,
    lorawanPhyVersion,
    frequencyPlanId,
    applicationId
  });

  // --- Tu decoder JS completo como string multilínea ---
  const decoderCode = `
    function Decoder(bytes, port) {
      var decoded = {};
      for (var i = 0; i < bytes.length; ) {
        var channel_id   = bytes[i++];
        var channel_type = bytes[i++];
        if (channel_id === 0xff && channel_type === 0x01) {
          decoded.ipso_version = readProtocolVersion(bytes[i]); i += 1;
        } else if (channel_id === 0xff && channel_type === 0x09) {
          decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2)); i += 2;
        } else if (channel_id === 0xff && channel_type === 0x0a) {
          decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2)); i += 2;
        } else if (channel_id === 0xff && channel_type === 0x0b) {
          decoded.device_status = "on"; i += 1;
        } else if (channel_id === 0xff && channel_type === 0x0f) {
          decoded.lorawan_class = readLoRaWANType(bytes[i]); i += 1;
        } else if (channel_id === 0xff && channel_type === 0x16) {
          decoded.sn = readSerialNumber(bytes.slice(i, i + 8)); i += 8;
        } else if (channel_id === 0xff && channel_type === 0xff) {
          decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2)); i += 2;
        } else if (channel_id === 0x01 && channel_type === 0x75) {
          decoded.battery = readUInt8(bytes[i]); i += 1;
        } else if (channel_id === 0x03 && channel_type === 0x67) {
          decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10; i += 2;
        } else if (channel_id === 0x04 && channel_type === 0x68) {
          decoded.humidity = readUInt8(bytes[i]) / 2; i += 1;
        } else if (channel_id === 0x20 && channel_type === 0xce) {
          var data = {};
          data.timestamp   = readUInt32LE(bytes.slice(i, i + 4));
          data.temperature = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
          data.humidity    = readUInt8(bytes[i + 6]) / 2;
          decoded.history = decoded.history || [];
          decoded.history.push(data);
          i += 7;
        } else {
          break;
        }
      }
      return decoded;
    }

    function readUInt8(b)      { return b & 0xff; }
    function readInt16LE(b)    { var v = (b[1] << 8) + b[0]; return v > 0x7fff ? v - 0x10000 : v; }
    function readUInt32LE(b)   { return ((b[3]<<24) + (b[2]<<16) + (b[1]<<8) + b[0]) >>> 0; }
    function readProtocolVersion(b) { return "v"+((b&0xf0)>>4)+"."+(b&0x0f); }
    function readHardwareVersion(b){ return "v"+(b[0]&0xff)+"."+((b[1]&0xff)>>4); }
    function readFirmwareVersion(b){ return "v"+(b[0]&0xff)+"."+(b[1]&0xff); }
    function readTslVersion(b)      { return "v"+(b[0]&0xff)+"."+(b[1]&0xff); }
    function readSerialNumber(b)    { return b.map(x=>("0"+(x&0xff).toString(16)).slice(-2)).join(""); }
    function readLoRaWANType(t)     {
      switch(t){
        case 0x00: return "ClassA";
        case 0x01: return "ClassB";
        case 0x02: return "ClassC";
        case 0x03: return "ClassCtoB";
        default:   return "Unknown";
      }
    }
  `;

  // PASO 1: Identity Server
  const isPayload = {
    end_device: {
      ids: {
        device_id: deviceId.toLowerCase(),
        application_ids: { application_id: applicationId },
        dev_eui: devEUI.toUpperCase(),
        join_eui: joinEUI.toUpperCase()
      },
      name: deviceId,
      description: `Creado el ${new Date().toLocaleString()}`,
      join_server_address: "eu1.cloud.thethings.network",
      network_server_address: "eu1.cloud.thethings.network",
      application_server_address: "eu1.cloud.thethings.network",
      version_ids: {
        brand_id: "milesight-iot",
        model_id: "em320-th",
        hardware_version: "v1",
        firmware_version: "1.0",
        band_id: "EU_863_870"
      },
      formatters: {
        uplink: {
          formatter_type: "javascript",
          formatter: decoderCode
        },
        downlink: {},
        event: {}
      }
    },
    field_mask: {
      paths: [
        "ids.device_id","ids.application_ids.application_id",
        "ids.dev_eui","ids.join_eui","name","description",
        "join_server_address","network_server_address","application_server_address",
        "version_ids.brand_id","version_ids.model_id",
        "version_ids.hardware_version","version_ids.firmware_version","version_ids.band_id",
        "formatters.uplink.formatter_type","formatters.uplink.formatter"
      ]
    }
  };
  console.log(`📦 Identity Server Payload:`, JSON.stringify(isPayload, null, 2));
  const isRes = await fetch(`${BASE_URL}/applications/${applicationId}/devices`, {
    method: "POST",
    headers: { Authorization: API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(isPayload)
  });
  if (!isRes.ok) {
    const err = await isRes.json();
    addLog?.(`❌ Identity Server: ${err.message||'desconocido'}`);
    throw new Error(err.message);
  }
  addLog?.(`✅ Registrado en Identity Server con Id de aplicacion: ${applicationId}`);
  await new Promise(r => setTimeout(r, 1000));

  // PASO 2: Join Server
  const jsPayload = {
    end_device: {
      ids: isPayload.end_device.ids,
      root_keys: { app_key: { key: appKey.toUpperCase() } }
    },
    field_mask: {
      paths: [
        "ids.device_id","ids.application_ids.application_id",
        "ids.dev_eui","ids.join_eui","root_keys.app_key.key"
      ]
    }
  };
  const jsRes = await fetch(`${BASE_URL}/js/applications/${applicationId}/devices`, {
    method: "POST",
    headers: { Authorization: API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(jsPayload)
  });
  addLog?.(jsRes.ok
    ? `✅ Claves registradas en Join Server`
    : `⚠️ Join Server: ${await jsRes.json().then(e=>e.message) || 'error'}`);
  await new Promise(r => setTimeout(r, 1000));

  // PASO 3: Network Server
  const nsPayload = {
    end_device: {
      ids: isPayload.end_device.ids,
      frequency_plan_id: frequencyPlanId,
      lorawan_phy_version: lorawanPhyVersion,
      lorawan_version: lorawanVersion,
      supports_join: true,
      multicast: false,
      supports_class_c: false,
      supports_class_b: false,
      mac_settings: {
        rx1_delay: 1,
        rx1_data_rate_offset: 0,
        rx2_data_rate_index: 3,
        rx2_frequency: "869525000",
        supports_32_bit_f_cnt: true
      }
    },
    field_mask: {
      paths: [
        "ids.device_id","ids.application_ids.application_id",
        "ids.dev_eui","ids.join_eui","frequency_plan_id",
        "lorawan_phy_version","lorawan_version","supports_join",
        "multicast","supports_class_c","supports_class_b",
        "mac_settings.rx1_delay","mac_settings.rx1_data_rate_offset",
        "mac_settings.rx2_data_rate_index","mac_settings.rx2_frequency",
        "mac_settings.supports_32_bit_f_cnt"
      ]
    }
  };
  console.log(`📦 Network Server Payload:`, JSON.stringify(nsPayload, null, 2));
  const nsRes = await fetch(`${BASE_URL}/ns/applications/${applicationId}/devices`, {
    method: "POST",
    headers: { Authorization: API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(nsPayload)
  });
  addLog?.(nsRes.ok
    ? `✅ Configurados parámetros LoRaWAN en Network Server`
    : `⚠️ Network Server: ${await nsRes.json().then(e=>e.message) || 'error'}`);
  await new Promise(r => setTimeout(r, 1000));

  // PASO 4: Application Server (registro base)
  const asPayload = {
    end_device: { ids: isPayload.end_device.ids },
    field_mask: {
      paths: [
        "ids.device_id","ids.application_ids.application_id",
        "ids.dev_eui","ids.join_eui"
      ]
    }
  };
  const asRes = await fetch(`${BASE_URL}/as/applications/${applicationId}/devices`, {
    method: "POST",
    headers: { Authorization: API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(asPayload)
  });
  addLog?.(asRes.ok
    ? `✅ Notificado al Application Server`
    : `⚠️ Application Server: ${await asRes.json().then(e=>e.message) || 'error'}`);

  // PASO 5: Actualizar el decoder uplink personalizado
  addLog?.(`🔄 Actualizando decoder uplink personalizado...`);
  const updatePayload = {
    end_device: {
      ids: {
        application_ids: { application_id: applicationId },
        device_id: deviceId.toLowerCase()
      },
      formatters: {
        up_formatter: "FORMATTER_JAVASCRIPT",
        up_formatter_parameter: decoderCode
      }
    },
    field_mask: {
      paths: [
        "formatters.up_formatter",
        "formatters.up_formatter_parameter"
      ]
    }
  };
  const updRes = await fetch(
    `${BASE_URL}/as/applications/${applicationId}/devices/${deviceId.toLowerCase()}`,
    {
      method: "PUT",
      headers: { Authorization: API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload)
    }
  );
  if (!updRes.ok) {
    const err = await updRes.json();
    addLog?.(`❌ Error actualizando decoder: ${err.message || 'desconocido'}`);
    throw new Error(err.message || 'Error actualizar decoder');
  }
  addLog?.(`✅ Decoder uplink personalizado actualizado`);

  // Confirmación final
  await new Promise(r => setTimeout(r, 1000));
  const finalRes = await fetch(
    `${BASE_URL}/applications/${applicationId}/devices/${deviceId.toLowerCase()}`,
    {
      method: "GET",
      headers: { Authorization: API_KEY, "Content-Type": "application/json" }
    }
  );
  if (!finalRes.ok) {
    addLog?.(`⚠️ No se pudo verificar la configuración final`);
    return null;
  }
  const finalData = await finalRes.json();
  console.log(`✅ Respuesta final de TTN:`, JSON.stringify(finalData, null, 2));
  addLog?.(`✅ Dispositivo "${deviceId}" registrado y decoder configurado correctamente en aplicación "${applicationId}".`);
  return finalData;
}
