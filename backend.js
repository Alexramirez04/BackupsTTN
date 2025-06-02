const express = require('express');
const cors = require('cors'); // Importamos CORS
const app = express();
const PORT = 3000;

app.use(cors()); // Habilitamos CORS para todas las rutas
app.use(express.json());

// Estructura para almacenar datos por aplicación y dispositivo
const aplicaciones = {};
const logs = []; // Guardamos todos los eventos importantes

// Función para asegurarse de que existe la estructura para una aplicación
function asegurarAplicacion(applicationId) {
  if (!aplicaciones[applicationId]) {
    aplicaciones[applicationId] = {
      sensores: {},
      historico: {}
    };
  }
  return aplicaciones[applicationId];
}

// Utilidad para guardar logs
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
  const applicationId = req.body?.end_device_ids?.application_ids?.application_id;
  const receivedAt = req.body?.received_at;

  if (deviceId && receivedAt) {
    const temperatura = req.body.uplink_message?.decoded_payload?.temperature;
    const humedad = req.body.uplink_message?.decoded_payload?.humidity;
    const timestamp = new Date(receivedAt);

    // Usar 'default' como applicationId si no se proporciona
    const appId = applicationId || 'default';

    // Asegurar que existe la estructura para esta aplicación
    const app = asegurarAplicacion(appId);

    // Guardar datos del sensor
    app.sensores[deviceId] = {
      lastSeen: timestamp,
      temperatura,
      humedad,
      applicationId: appId
    };

    // Inicializar el histórico si no existe
    if (!app.historico[deviceId]) app.historico[deviceId] = [];

    // Añadir datos al histórico
    app.historico[deviceId].push({
      ts: timestamp.toISOString(),
      temperatura,
      humedad
    });

    // Limitar el histórico a 20 entradas
    if (app.historico[deviceId].length > 20) {
      app.historico[deviceId] = app.historico[deviceId].slice(-20);
    }

    const resumen = `📦 ${deviceId} (${appId}) → ${timestamp.toISOString()} | 🌡 ${temperatura} °C | 💧 ${humedad} %`;
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
  const applicationId = req.query.applicationId || 'default';

  // Buscar el dispositivo en todas las aplicaciones si no se especifica una
  if (applicationId === 'default') {
    // Buscar en todas las aplicaciones
    for (const appId in aplicaciones) {
      const app = aplicaciones[appId];
      if (app.sensores[deviceId]) {
        const data = app.sensores[deviceId];

        const ahora = new Date();
        const minutos = (ahora - data.lastSeen) / 1000 / 60;
        const status = minutos <= 5 ? 'active' : 'inactive';

        agregarLog(`🔍 Estado solicitado de ${deviceId} (app: ${appId}): ${status}`);

        return res.json({
          deviceId,
          applicationId: appId,
          status,
          lastSeen: data.lastSeen,
          temperatura: data.temperatura ?? null,
          humedad: data.humedad ?? null
        });
      }
    }

    // Si no se encuentra en ninguna aplicación
    agregarLog(`❓ Estado solicitado de ${deviceId}: desconocido (no encontrado en ninguna aplicación)`);
    return res.json({ deviceId, status: 'desconocido', lastSeen: null });
  }

  // Buscar en la aplicación específica
  const app = aplicaciones[applicationId];
  if (!app || !app.sensores[deviceId]) {
    agregarLog(`❓ Estado solicitado de ${deviceId} (app: ${applicationId}): desconocido`);
    return res.json({ deviceId, applicationId, status: 'desconocido', lastSeen: null });
  }

  const data = app.sensores[deviceId];
  const ahora = new Date();
  const minutos = (ahora - data.lastSeen) / 1000 / 60;
  const status = minutos <= 5 ? 'active' : 'inactive';

  agregarLog(`🔍 Estado solicitado de ${deviceId} (app: ${applicationId}): ${status}`);

  res.json({
    deviceId,
    applicationId,
    status,
    lastSeen: data.lastSeen,
    temperatura: data.temperatura ?? null,
    humedad: data.humedad ?? null
  });
});

// Histórico
app.get('/historico/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const applicationId = req.query.applicationId || 'default';

  // Buscar el histórico en todas las aplicaciones si no se especifica una
  if (applicationId === 'default') {
    // Buscar en todas las aplicaciones
    for (const appId in aplicaciones) {
      const app = aplicaciones[appId];
      if (app.historico[deviceId] && app.historico[deviceId].length > 0) {
        const data = app.historico[deviceId];
        agregarLog(`📈 Histórico solicitado de ${deviceId} (app: ${appId}) (${data.length} puntos)`);
        return res.json(data);
      }
    }

    // Si no se encuentra en ninguna aplicación
    agregarLog(`📈 Histórico solicitado de ${deviceId}: vacío (no encontrado en ninguna aplicación)`);
    return res.json([]);
  }

  // Buscar en la aplicación específica
  const app = aplicaciones[applicationId];
  if (!app || !app.historico[deviceId]) {
    agregarLog(`📈 Histórico solicitado de ${deviceId} (app: ${applicationId}): vacío`);
    return res.json([]);
  }

  const data = app.historico[deviceId] || [];
  agregarLog(`📈 Histórico solicitado de ${deviceId} (app: ${applicationId}) (${data.length} puntos)`);
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
