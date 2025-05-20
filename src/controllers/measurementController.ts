//controller.ts
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { mapMeasurementDAOToDTO } from "@services/mapperService";

export async function getSensorMeasurements(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string
): Promise<MeasurementDTO[]> {
  const measurementRepo = new MeasurementRepository();
  return (await measurementRepo.getSensorMeasurements(networkCode, gatewayMac, sensorMac));
}

export async function storeMeasurements(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  measurements: MeasurementDTO[]
): Promise<void> {
  const measurementRepo = new MeasurementRepository();
  await measurementRepo.storeMeasurements(networkCode, gatewayMac, sensorMac, measurements);
}

export async function getMeasurement(id: number): Promise<MeasurementDTO> {
  const measurementRepo = new MeasurementRepository();
  return await measurementRepo.getMeasurement(id);
}

export async function updateMeasurement(id: number, dto: MeasurementDTO): Promise<void> {
  const measurementRepo = new MeasurementRepository();
  await measurementRepo.updateMeasurement(id, dto);
}

export async function deleteMeasurement(id: number): Promise<void> {
  const measurementRepo = new MeasurementRepository();
  await measurementRepo.deleteMeasurement(id);
}

