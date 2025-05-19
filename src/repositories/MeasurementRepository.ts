// repositories/MeasurementRepository.ts
import type { Measurement } from "@models/dto/Measurement";
import { AppError } from "@models/errors/AppError";

// In-memory store
const measurementStore: (Measurement & {
  sensorMac: string;
  networkCode?: string;
  isOutlier?: boolean;
})[] = [];


// Store a measurement in memory
export const storeMeasurement = async (sensorMac: string, dto: Measurement): Promise<void> => {
  if (!dto.createdAt || typeof dto.value !== "number") {
    throw new AppError("Invalid measurement data", 400);
  }

  measurementStore.push({
    sensorMac,
    createdAt: new Date(dto.createdAt),
    value: dto.value,
    isOutlier: false,
    networkCode: (dto as any).networkCode ?? undefined,
  });


};

// Get all measurements of a sensor
export const getSensorMeasurements = async (sensorMac: string): Promise<Measurement[]> => {
  return measurementStore
    .filter((m) => m.sensorMac === sensorMac)
    .map(({ createdAt, value, isOutlier }) => ({ createdAt, value, isOutlier }));
};

// Get all measurements of a network
export const getNetworkMeasurements = async (networkCode: string): Promise<Measurement[]> => {
  return measurementStore
    .filter((m) => m.networkCode === networkCode)
    .map(({ createdAt, value, isOutlier }) => ({ createdAt, value, isOutlier }));
};

// Esporta il raw store per debug/testing
export { measurementStore };
