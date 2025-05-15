// controllers/measurementController.ts
import type { Measurement } from "@models/dto/Measurement";
import {
  storeMeasurement as storeRepo,
  getSensorMeasurements as getSensorRepo,
  getNetworkMeasurements as getNetworkRepo,
} from "@repositories/MeasurementRepository";
import { calculateStats, detectOutliers } from "statsutils";
import { AppError } from "@models/errors/AppError";

// Store a new measurement for a sensor
export const storeMeasurement = async (sensorMac: string, dto: Measurement): Promise<void> => {
  await storeRepo(sensorMac, dto);
};

// Return all measurements for a specific sensor
export const getSensorMeasurements = async (sensorMac: string): Promise<Measurement[]> => {
  return await getSensorRepo(sensorMac);
};

// Return stats (mean, variance, std, thresholds) for a sensor
export const getSensorStats = async (sensorMac: string) => {
  const data = await getSensorRepo(sensorMac);
  const values = data.map((m) => m.value);
  if (!values.length) throw new AppError("No data found for sensor", 404);
  return calculateStats(values);
};

// Return outliers only for a sensor
export const getSensorOutliers = async (sensorMac: string): Promise<Measurement[]> => {
  const data = await getSensorRepo(sensorMac);
  const values = data.map((m) => m.value);
  if (!values.length) throw new AppError("No data found for sensor", 404);
  const { lowerThreshold, upperThreshold } = calculateStats(values);
  return detectOutliers(
    data.map(({ createdAt, value }) => ({ createdAt, value })),
    lowerThreshold,
    upperThreshold
  );
};

// Return all measurements for a network
export const getNetworkMeasurements = async (networkCode: string): Promise<Measurement[]> => {
  return await getNetworkRepo(networkCode);
};

// Return stats (mean, variance, std, thresholds) for a network
export const getNetworkStats = async (networkCode: string) => {
  const data = await getNetworkRepo(networkCode);
  const values = data.map((m) => m.value);
  if (!values.length) throw new AppError("No data found for network", 404);
  return calculateStats(values);
};

// Return outliers only for a network
export const getNetworkOutliers = async (networkCode: string): Promise<Measurement[]> => {
  const data = await getNetworkRepo(networkCode);
  const values = data.map((m) => m.value);
  if (!values.length) throw new AppError("No data found for network", 404);
  const { lowerThreshold, upperThreshold } = calculateStats(values);
  return detectOutliers(
    data.map(({ createdAt, value }) => ({ createdAt, value })),
    lowerThreshold,
    upperThreshold
  );
};
