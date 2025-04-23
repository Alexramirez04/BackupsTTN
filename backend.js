const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Joi = require('joi');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors()); // Habilitar CORS para solicitudes desde otros dominios

// Configuración de TTN
const BASE_URL = "https://eu1.cloud.thethings.network/api/v3";
const API_KEY = "Bearer NNSXS.SRWUH2SEOODOSN3U2W5HQF6YMWM2PBCF62HSXJQ.AXH5KOOEGMKGUPS7KQSCYJW76WGUHLL3DHH2TWOLRXIUS3QQRIHA";  // API_KEY proporcionada
const APP_ID = "app-de-pruebas";  // Reemplaza con el ID de tu aplicación en TTN

// Variables para almacenar el estado y los datos históricos de los sensores
const sensores = {};
const historico = {};
const logs = []; // Guardamos todos los eventos importantes

// 🧠 Utilidad para guardar logs
function agregarLog(mensaje) {
  logs.push({
    ts: new Date().toISOString(),
    mensaje
  });
  if (logs.length > 100) logs.splice(0, logs.length - 100); // Limitar a 100 logs
}

// Validación de los datos que vienen de la app para registrar dispositivos
const deviceSchema = Joi.object({
  deviceId: Joi.string().alphanum().min(1).required(),
  devEUI: Joi.string().length(16).hex().required(),
  joinEUI: Joi.string().length(16).hex().required(),
  appKey: Joi.string().length(32).hex().required()
});

// Ruta para registrar el dispositivo en TTN
app.post('/registrar-dispositivo', async (req, res) => {
  const { deviceId, devEUI, joinEUI, appKey } = req.body;

  // Validación de los datos
  const { error } = deviceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: 'Datos incorrectos: ' + error.details[0].message });
  }

  const payload = {
    end_device: {
      ids: {
        device_id: deviceId.toLowerCase(),
        dev_eui: devEUI.toUpperCase().replace(/\s/g, ''),
        join_eui: joinEUI.toUpperCase().replace(/\s/g, '')
      },
      root_keys: {
        app_key: {
          key: appKey.toUpperCase().replace(/\s/g, '')
        }
      },
      lorawan_version: "1.0.3",  // Si se requiere una versión específica de LoRaWAN
      frequency_plan_id: "EU_863_870",  // Especifica el plan de frecuencia
      regional_parameters_version: "RP001-1.0.3-A",  // Asegúrate de que esta versión sea válida
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

  try {
    // Realizar la solicitud a TTN para registrar el dispositivo
    const response = await axios.post(
      `${BASE_URL}/applications/${APP_ID}/devices`,
      payload,
      {
        headers: {
          Authorization: API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    // Responder con el resultado de TTN
    res.json(response.data);
  } catch (error) {
    // Manejo de errores más detallado
    console.error('Error al registrar dispositivo en TTN:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error al registrar el dispositivo',
      details: error.response?.data || error.message
    });
  }
});

// Ruta para recibir los datos de los sensores desde TTN (Webhook)
app.post('/webhook/ttn', (req, res) => {
  const deviceId = req.body?.end_device_ids?.device_id;
  const receivedAt = req.body?.received_at;

  if (deviceId && receivedAt) {
    const temperatura = req.body.uplink_message?.decoded_payload?.temperature;
    const humedad = req.body.uplink_message?.decoded_payload?.humidity;
    const timestamp = new Date(receivedAt);

    sensores[deviceId] = {
      lastSeen: timestamp,
      temperatura,
      humedad
    };

    if (!historico[deviceId]) historico[deviceId] = [];

    historico[deviceId].push({
      ts: timestamp.toISOString(),
      temperatura,
      humedad
    });

    if (historico[deviceId].length > 20) {
      historico[deviceId] = historico[deviceId].slice(-20);
    }

    const resumen = `📦 ${deviceId} → ${timestamp.toISOString()} | 🌡 ${temperatura} °C | 💧 ${humedad} %`;
    console.log(resumen);
    agregarLog(resumen);
  } else {
    console.log('❌ Webhook recibido sin datos válidos');
    agregarLog('❌ Webhook recibido sin datos válidos');
  }

  res.status(200).send('OK');
});

// Ruta para obtener el estado actual de un dispositivo
app.get('/estado/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const data = sensores[deviceId];

  if (!data) {
    agregarLog(`❓ Estado solicitado de ${deviceId}: desconocido`);
    return res.json({ deviceId, status: 'desconocido', lastSeen: null });
  }

  const ahora = new Date();
  const minutos = (ahora - data.lastSeen) / 1000 / 60;
  const status = minutos <= 5 ? 'active' : 'inactive';

  agregarLog(`🔍 Estado solicitado de ${deviceId}: ${status}`);

  res.json({
    deviceId,
    status,
    lastSeen: data.lastSeen,
    temperatura: data.temperatura ?? null,
    humedad: data.humedad ?? null
  });
});

// Ruta para obtener el histórico de un dispositivo
app.get('/historico/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const data = historico[deviceId] || [];
  agregarLog(`📈 Histórico solicitado de ${deviceId} (${data.length} puntos)`);
  res.json(data);
});

// Logs generales de la app
app.get('/logs', (req, res) => {
  res.json(logs);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend funcionando en http://localhost:${PORT}`);
  agregarLog('🚀 Backend iniciado');
});
