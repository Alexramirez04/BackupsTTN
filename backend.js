const express = require('express');
const cors = require('cors'); // ✅ Importamos CORS
const app = express();
const PORT = 3000;

app.use(cors()); // ✅ Habilitamos CORS para todas las rutas
app.use(express.json());

const sensores = {};
const historico = {};
const logs = []; // ✅ Guardamos todos los eventos importantes

// 🧠 Utilidad para guardar logs
function agregarLog(mensaje) {
  logs.push({
    ts: new Date().toISOString(),
    mensaje
  });
  if (logs.length > 100) logs.splice(0, logs.length - 100); // máx. 100 logs
}

// TTN enviará aquí los uplinks
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

// Estado actual
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

// Histórico
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

app.listen(PORT, () => {
  console.log(`🚀 Backend funcionando en http://localhost:${PORT}`);
  agregarLog('🚀 Backend iniciado');
});
