/**
 * Definición de tipos para el módulo ttnDeviceRegistration
 */

interface VersionIds {
  brandId: string;
  modelId: string;
  hardwareVersion: string;
  firmwareVersion: string;
  bandId: string;
}

interface DeviceRegistrationParams {
  deviceId: string;
  devEUI: string;
  joinEUI: string;
  appKey: string;
  lorawanVersion?: string;
  lorawanPhyVersion?: string;
  frequencyPlanId?: string;
  applicationId?: string;
  versionIds?: VersionIds | null;
}

interface MilesightRegistrationParams {
  deviceId: string;
  devEUI: string;
  joinEUI: string;
  appKey: string;
  applicationId?: string;
}

interface FormatterInfo {
  device_id: string;
  application_id: string;
  formatter_type: string;
  using_device_repo: boolean;
  details: any;
}

/**
 * Registra un dispositivo en TTN v3 siguiendo el flujo completo de 4 pasos
 */
export function registerTTNDevice(params: DeviceRegistrationParams, addLog?: (message: string) => void): Promise<any>;

/**
 * Alias para registerTTNDevice
 */
export const registerDevice: typeof registerTTNDevice;

/**
 * Consulta la información de un dispositivo en TTN y determina qué tipo de decodificador está usando
 */
export function checkDeviceFormatter(
  deviceId: string,
  applicationId?: string,
  addLog?: (message: string) => void
): Promise<FormatterInfo>;

/**
 * Registra un dispositivo Milesight EM320-TH utilizando el repositorio de dispositivos
 */
export function registerMilesightEM320TH(
  params: MilesightRegistrationParams,
  addLog?: (message: string) => void
): Promise<any>;

/**
 * Corrige el decodificador de un dispositivo Milesight EM320-TH existente
 */
export function fixMilesightDecoder(
  deviceId: string,
  applicationId?: string,
  addLog?: (message: string) => void
): Promise<FormatterInfo>;
