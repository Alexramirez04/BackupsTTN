import * as SecureStore from 'expo-secure-store';
const BASE_URL = "https://eu1.cloud.thethings.network/api/v3";
const API_KEY = "Bearer NNSXS.6RL5W6LGZMWMTD4VGUO4YHBCWBW2FLZG7H5OHHQ.2FJ2MEIJCC3CAHJ2634NWKT5AI7ZITLPGPNS3J2GR5Q5ZPMUUHAQ";
import { BACKEND_URL } from '../config/appConfig.new';

// LISTA DE APLICACIONES
export async function getApplications(addLog) {
  addLog?.("📡 Obteniendo lista de aplicaciones...");
  const apiKey = await SecureStore.getItemAsync('TTN_API_KEY');
  if (!apiKey) throw new Error('No hay API Key guardada.');
  const response = await fetch(`${BASE_URL}/applications`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    addLog?.(`❌ Error al obtener aplicaciones: ${error.message}`);
    throw new Error(error.message || 'Error al obtener las aplicaciones');
  }

  const data = await response.json();
  const applications = data.applications || [];
  console.log("Lista de aplicaciones:", JSON.stringify(applications, null, 2));

  // Devolver la lista de aplicaciones sin modificar
  return applications;
}

// OBTENER NOMBRES DE APLICACIONES
export async function getApplicationNames(applicationIds, addLog) {
  addLog?.(`🔍 Obteniendo nombres de aplicaciones...`);

  // Crear un objeto para almacenar los nombres de las aplicaciones
  const applicationNames = {};

  // Intentar obtener los nombres desde la API de usuarios
  try {
    const response = await fetch(`${BASE_URL}/users/alexramirez04/applications`, {
      method: "GET",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Respuesta de aplicaciones del usuario para nombres:", JSON.stringify(data, null, 2));

      if (data.applications && data.applications.length > 0) {
        // Extraer los nombres de las aplicaciones
        data.applications.forEach(app => {
          if (app.ids && app.ids.application_id && app.name) {
            applicationNames[app.ids.application_id] = {
              name: app.name,
              description: app.description || null
            };
          }
        });

        console.log("Nombres de aplicaciones obtenidos:", JSON.stringify(applicationNames, null, 2));
        return applicationNames;
      }
    }
  } catch (error) {
    console.error("Error al obtener nombres de aplicaciones desde usuarios:", error);
  }

  // Si no pudimos obtener los nombres desde la API de usuarios, intentamos obtenerlos uno por uno
  await Promise.all(
    applicationIds.map(async (id) => {
      try {
        const appDetails = await getApplicationById(id, addLog);
        if (appDetails && appDetails.name) {
          applicationNames[id] = {
            name: appDetails.name,
            description: appDetails.description || null
          };
        } else if (appDetails && appDetails.application && appDetails.application.name) {
          applicationNames[id] = {
            name: appDetails.application.name,
            description: appDetails.application.description || null
          };
        }
      } catch (error) {
        console.error(`Error al obtener nombre para ${id}:`, error);
      }
    })
  );

  console.log("Nombres de aplicaciones obtenidos (método alternativo):", JSON.stringify(applicationNames, null, 2));
  return applicationNames;
}

// DETALLES DE UNA APLICACIÓN
export async function getApplicationById(applicationId, addLog) {
  addLog?.(`🔍 Obteniendo info de aplicación "${applicationId}"...`);

  const response = await fetch(`${BASE_URL}/applications/${applicationId}`, {
    method: 'GET',
    headers: {
      Authorization: API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    addLog?.(`❌ Error al obtener aplicación ${applicationId}: ${error.message}`);
    throw new Error(error.message || 'Error al obtener la aplicación');
  }

  // Obtener la respuesta completa
  const responseData = await response.json();
  console.log(`Respuesta completa para ${applicationId}:`, JSON.stringify(responseData, null, 2));

  // Verificar si la respuesta tiene la estructura esperada
  if (responseData && !responseData.name && responseData.application) {
    console.log(`Extrayendo datos de application para ${applicationId}`);
    return responseData.application;
  }

  return responseData;
}

// CREAR UNA APLICACIÓN
export async function createApplication({ applicationId, name, description }, addLog) {
  addLog?.(`📦 Creando aplicación "${applicationId}"...`);

  // Imprimir información detallada para depuración
  console.log(`Intentando crear aplicación con ID: ${applicationId}`);
  console.log(`API Key utilizada: ${API_KEY.substring(0, 20)}...`);

  // Formato exacto según el tutorial
  const payload = {
    application: {
      ids: { application_id: applicationId },
      name,
      description
    }
  };

  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    // Usar tu nombre de usuario específico de TTN
    const username = "alexramirez04"; // Tu nombre de usuario real de TTN
    console.log(`Usando nombre de usuario específico: ${username}`);

    // Usar la URL específica con tu nombre de usuario
    const url = `${BASE_URL}/users/${username}/applications`;
    console.log(`Intentando crear aplicación en: ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log(`Respuesta de la API: ${response.status} ${response.statusText}`);

    // Intentar leer el cuerpo de la respuesta incluso si hay error
    let responseBody;
    try {
      const textResponse = await response.text();
      console.log("Respuesta en texto:", textResponse);

      if (textResponse) {
        responseBody = JSON.parse(textResponse);
      }
    } catch (parseError) {
      console.error("Error al parsear la respuesta:", parseError);
    }

    if (!response.ok) {
      // Si falla, intentar con la ruta alternativa usando directamente /applications
      console.log("Intentando ruta alternativa directa: /applications");

      const alternativeUrl = `${BASE_URL}/applications`;
      console.log(`URL alternativa: ${alternativeUrl}`);

      const altResponse = await fetch(alternativeUrl, {
        method: "POST",
        headers: {
          Authorization: API_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      console.log(`Respuesta de la API (ruta alternativa): ${altResponse.status} ${altResponse.statusText}`);

      let altResponseBody;
      try {
        const altTextResponse = await altResponse.text();
        console.log("Respuesta en texto (ruta alternativa):", altTextResponse);

        if (altTextResponse) {
          altResponseBody = JSON.parse(altTextResponse);
        }
      } catch (parseError) {
        console.error("Error al parsear la respuesta (ruta alternativa):", parseError);
      }

      if (!altResponse.ok) {
        // Si también falla, intentar con la organización
        console.log("Intentando ruta alternativa con organización: /organizations/ttn/applications");

        const orgUrl = `${BASE_URL}/organizations/ttn/applications`;
        console.log(`URL de organización: ${orgUrl}`);

        const orgResponse = await fetch(orgUrl, {
          method: "POST",
          headers: {
            Authorization: API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        console.log(`Respuesta de la API (ruta de organización): ${orgResponse.status} ${orgResponse.statusText}`);

        let orgResponseBody;
        try {
          const orgTextResponse = await orgResponse.text();
          console.log("Respuesta en texto (ruta de organización):", orgTextResponse);

          if (orgTextResponse) {
            orgResponseBody = JSON.parse(orgTextResponse);
          }
        } catch (parseError) {
          console.error("Error al parsear la respuesta (ruta de organización):", parseError);
        }

        if (!orgResponse.ok) {
          const errorMessage = orgResponseBody?.message || orgResponse.statusText || 'Error al crear la aplicación';
          addLog?.(`❌ Error al crear aplicación: ${errorMessage}`);
          throw new Error(errorMessage);
        }

        addLog?.(`✅ Aplicación "${applicationId}" creada correctamente (vía organización)`);
        return orgResponseBody || {};
      }

      addLog?.(`✅ Aplicación "${applicationId}" creada correctamente (vía ruta directa)`);
      return altResponseBody || {};
    }

    // Si la respuesta original fue exitosa
    addLog?.(`✅ Aplicación "${applicationId}" creada correctamente`);
    return responseBody || {};
  } catch (error) {
    console.error("Error completo:", error);
    throw error;
  }
}

// ACTUALIZAR UNA APLICACIÓN
export async function updateApplication(applicationId, { name, description }, addLog) {
  addLog?.(`✏️ Actualizando aplicación "${applicationId}"...`);

  const payload = {
    application: {
      name,
      description
    }
  };

  const response = await fetch(`${BASE_URL}/applications/${applicationId}`, {
    method: "PUT",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    addLog?.(`❌ Error al actualizar aplicación: ${error.message}`);
    throw new Error(error.message || 'Error al actualizar la aplicación');
  }

  addLog?.(`✅ Aplicación "${applicationId}" actualizada correctamente`);
  return response.json();
}

// ELIMINAR UNA APLICACIÓN
export async function deleteApplication(applicationId, addLog) {
  addLog?.(`🗑️ Eliminando aplicación "${applicationId}"...`);

  const response = await fetch(`${BASE_URL}/applications/${applicationId}`, {
    method: "DELETE",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    addLog?.(`❌ Error al eliminar aplicación ${applicationId}: ${error.message}`);
    throw new Error(error.message || 'Error al eliminar la aplicación');
  }

  addLog?.(`✅ Aplicación "${applicationId}" eliminada`);
  return response.json();
}
