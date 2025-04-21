const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Aquí guardamos la última vez que se vio cada sensor
const sensores = {};

// TTN mandará aquí los datos
app.post('/webhook/ttn', (req, res) => {
  const deviceId = req.body?.end_device_ids?.device_id;
  const receivedAt = req.body?.received_at;

  if (deviceId && receivedAt) {
    sensores[deviceId] = new Date(receivedAt);
    console.log(`📦 ${deviceId} → ${receivedAt}`);
  } else {
    console.log('❌ Webhook recibido sin datos válidos');
  }

  res.status(200).send('OK');
});

// Tu app pregunta aquí si un sensor está activo
app.get('/estado/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const lastSeen = sensores[deviceId];

  if (!lastSeen) {
    return res.json({ deviceId, status: 'desconocido', lastSeen: null });
  }

  const ahora = new Date();
  const minutos = (ahora - lastSeen) / 1000 / 60;
  const status = minutos <= 5 ? 'active' : 'inactive';

  res.json({ deviceId, status, lastSeen });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend funcionando en http://localhost:${PORT}`);
});
