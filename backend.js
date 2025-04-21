const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Guardamos la última vez y los datos del sensor
const sensores = {};

// TTN mandará aquí los datos del sensor
app.post('/webhook/ttn', (req, res) => {
  const deviceId = req.body?.end_device_ids?.device_id;
  const receivedAt = req.body?.received_at;

  if (deviceId && receivedAt) {
    const temperatura = req.body.uplink_message?.decoded_payload?.temperature;
    const humedad = req.body.uplink_message?.decoded_payload?.humidity;
  
    sensores[deviceId] = {
      lastSeen: new Date(receivedAt),
      temperatura,
      humedad
    };
  
    console.log(`📦 ${deviceId} → ${receivedAt}`);
    console.log('📊 Datos recibidos:', { temperatura, humedad });
  
    // 👇 Añade esta línea para ver todo el JSON
    console.log(JSON.stringify(req.body, null, 2));
  }
   else {
    console.log('❌ Webhook recibido sin datos válidos');
  }

  res.status(200).send('OK');
});

// Endpoint para que la app pregunte el estado del dispositivo
app.get('/estado/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const data = sensores[deviceId];

  if (!data) {
    return res.json({ deviceId, status: 'desconocido', lastSeen: null });
  }

  const ahora = new Date();
  const minutos = (ahora - data.lastSeen) / 1000 / 60;
  const status = minutos <= 5 ? 'active' : 'inactive';

  res.json({
    deviceId,
    status,
    lastSeen: data.lastSeen,
    temperatura: data.temperatura ?? null,
    humedad: data.humedad ?? null
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend funcionando en http://localhost:${PORT}`);
});
