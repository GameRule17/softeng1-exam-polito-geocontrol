import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";
import { Stats as StatsDTO } from "@dto/Stats";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import {
    createMeasurementsDTO,
    createStatsDTO
} from "@services/mapperService";

import { calculateStats, mapOutliers, extractOnlyOutliers } from "statsutils";

export async function getMeasurementsSpecificSensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
): Promise<MeasurementsDTO> {
    const measurementRepository = new MeasurementRepository();
    const measurements = await measurementRepository.getMeasurementsSpecificSensor(
        networkCode,
        gatewayMac,
        sensorMac,
        startDate,
        endDate
    );

    const stats = calculateStats(
        measurements.map((measurement) => measurement.value)
    );

    const { mean, variance, upperThreshold, lowerThreshold } = stats;

    const mappedMeasurementsWithOutliers = mapOutliers(
        measurements,
        lowerThreshold,
        upperThreshold
    );

    const statsDTO = createStatsDTO(
        mean,
        variance,
        upperThreshold,
        lowerThreshold,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
    );

    return createMeasurementsDTO(sensorMac, statsDTO, mappedMeasurementsWithOutliers);
}

export async function getStatisticsSpecificSensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
): Promise<StatsDTO> {
    const measurementRepository = new MeasurementRepository();
    const measurements = await measurementRepository.getMeasurementsSpecificSensor(
        networkCode,
        gatewayMac,
        sensorMac,
        startDate,
        endDate
    );

    const stats = calculateStats(
        measurements.map((measurement) => measurement.value)
    );

    const { mean, variance, upperThreshold, lowerThreshold } = stats;

    return createStatsDTO(
        mean,
        variance,
        upperThreshold,
        lowerThreshold,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
    );
}

export async function getOnlyOutliersSpecificSensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    startDate?: string,
    endDate?: string
): Promise<MeasurementsDTO> {
    const measurementRepository = new MeasurementRepository();
    const measurements = await measurementRepository.getMeasurementsSpecificSensor(
        networkCode,
        gatewayMac,
        sensorMac,
        startDate,
        endDate
    );

    const stats = calculateStats(
        measurements.map((measurement) => measurement.value)
    );

    const { mean, variance, upperThreshold, lowerThreshold } = stats;

    const statsDTO = createStatsDTO(
        mean,
        variance,
        upperThreshold,
        lowerThreshold,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
    );

    const mappedMeasurementsWithOutliers = mapOutliers(
        measurements,
        lowerThreshold,
        upperThreshold
    );

    const outliers = extractOnlyOutliers(mappedMeasurementsWithOutliers);

    return createMeasurementsDTO(sensorMac, statsDTO, outliers);
}

export async function storeMeasurementForASensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    measurementDTO: MeasurementDTO[]
): Promise<MeasurementDTO[]> {
    const measurementRepository = new MeasurementRepository();
    const measurement = await measurementRepository.storeMeasurementForASensor(
        networkCode,
        gatewayMac,
        sensorMac,
        measurementDTO
    );

    return measurement;
}

export async function getMeasurementsPerNetwork(
    networkCode: string,
    sensorMacs?: string[],
    startDate?: string,
    endDate?: string
): Promise<MeasurementsDTO[]> {
    const measurementRepository = new MeasurementRepository();
    const networkRepository = new NetworkRepository();

    const sensors = await networkRepository.getAllSensorsOfNetwork(networkCode);
    if (sensors.length === 0) {
        throw new Error(`No sensors found for network code ${networkCode}`);
    }

    let measurements;
    let measurementsDTO = [];

    if (sensorMacs == undefined || sensorMacs.length === 0) {
        // restituisci un array di MeasurementsDTO per ogni sensore facente parte della network

        for (const sensor of sensors) {
            const sensorMac = sensor.macAddress;
            measurements = await measurementRepository.getMeasurementsSpecificSensor(
                networkCode,
                sensor.gateway.macAddress,
                sensorMac,
                startDate,
                endDate
            );

            const stats = calculateStats(
                measurements.map((measurement) => measurement.value)
            );

            const { mean, variance, upperThreshold, lowerThreshold } = stats;

            const mappedMeasurementsWithOutliers = mapOutliers(
                measurements,
                lowerThreshold,
                upperThreshold
            );

            const statsDTO = createStatsDTO(
                mean,
                variance,
                upperThreshold,
                lowerThreshold,
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined
            );

            measurementsDTO.push(
                createMeasurementsDTO(sensorMac, statsDTO, mappedMeasurementsWithOutliers)
            );
        }

        return measurementsDTO;

    } else {
        for (const sensorMac of sensorMacs) {
            const sensor = sensors.find((sensor) => sensor.macAddress === sensorMac);

            if (sensor) {
                measurements = await measurementRepository.getMeasurementsSpecificSensor(
                    networkCode,
                    sensor.gateway.macAddress,
                    sensorMac,
                    startDate,
                    endDate
                );

                const stats = calculateStats(
                    measurements.map((measurement) => measurement.value)
                );

                const { mean, variance, upperThreshold, lowerThreshold } = stats;

                const mappedMeasurementsWithOutliers = mapOutliers(
                    measurements,
                    lowerThreshold,
                    upperThreshold
                );

                const statsDTO = createStatsDTO(
                    mean,
                    variance,
                    upperThreshold,
                    lowerThreshold,
                    startDate ? new Date(startDate) : undefined,
                    endDate ? new Date(endDate) : undefined
                );

                measurementsDTO.push(
                    createMeasurementsDTO(sensorMac, statsDTO, mappedMeasurementsWithOutliers)
                );
            }
        }

        return measurementsDTO;
    }
}

export async function getStatisticsPerNetwork(
    networkCode: string,
    sensorMacs?: string[],
    startDate?: string,
    endDate?: string
): Promise<MeasurementsDTO[]> {
    const measurementRepository = new MeasurementRepository();
    const networkRepository = new NetworkRepository();

    const sensors = await networkRepository.getAllSensorsOfNetwork(networkCode);
    if (sensors.length === 0) {
        throw new Error(`No sensors found for network code ${networkCode}`);
    }

    let measurements;
    let measurementsDTO = [];

    if (sensorMacs == undefined || sensorMacs.length === 0) {
        for (const sensor of sensors) {
            const sensorMac = sensor.macAddress;
            measurements = await measurementRepository.getMeasurementsSpecificSensor(
                networkCode,
                sensor.gateway.macAddress,
                sensorMac,
                startDate,
                endDate
            );

            const stats = calculateStats(
                measurements.map((measurement) => measurement.value)
            );

            const { mean, variance, upperThreshold, lowerThreshold } = stats;

            const statsDTO = createStatsDTO(
                mean,
                variance,
                upperThreshold,
                lowerThreshold,
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined
            )

            measurementsDTO.push(
                createMeasurementsDTO(sensorMac, statsDTO)
            );

        }

        return measurementsDTO;

    } else {
        for (const sensorMac of sensorMacs) {
            const sensor = sensors.find((sensor) => sensor.macAddress === sensorMac);

            if (sensor) {
                measurements = await measurementRepository.getMeasurementsSpecificSensor(
                    networkCode,
                    sensor.gateway.macAddress,
                    sensorMac,
                    startDate,
                    endDate
                );

                const stats = calculateStats(
                    measurements.map((measurement) => measurement.value)
                );

                const { mean, variance, upperThreshold, lowerThreshold } = stats;

                const statsDTO = createStatsDTO(
                    mean,
                    variance,
                    upperThreshold,
                    lowerThreshold,
                    startDate ? new Date(startDate) : undefined,
                    endDate ? new Date(endDate) : undefined
                )

                measurementsDTO.push(
                    createMeasurementsDTO(sensorMac, statsDTO)
                );
            }
        }

        return measurementsDTO;
    }
}

export async function getOutliersPerNetwork(
    networkCode: string,
    sensorMacs?: string[],
    startDate?: string,
    endDate?: string
): Promise<MeasurementsDTO[]> {
    const measurementRepository = new MeasurementRepository();
    const networkRepository = new NetworkRepository();

    const sensors = await networkRepository.getAllSensorsOfNetwork(networkCode);
    if (sensors.length === 0) {
        throw new Error(`No sensors found for network code ${networkCode}`);
    }

    let measurements;
    let measurementsDTO = [];

    if (sensorMacs == undefined || sensorMacs.length === 0) {
        for (const sensor of sensors) {
            const sensorMac = sensor.macAddress;
            measurements = await measurementRepository.getMeasurementsSpecificSensor(
                networkCode,
                sensor.gateway.macAddress,
                sensorMac,
                startDate,
                endDate
            );

            const stats = calculateStats(
                measurements.map((measurement) => measurement.value)
            );

            const { mean, variance, upperThreshold, lowerThreshold } = stats;

            const mappedMeasurementsWithOutliers = mapOutliers(
                measurements,
                lowerThreshold,
                upperThreshold
            );

            const outliers = extractOnlyOutliers(mappedMeasurementsWithOutliers);

            const statsDTO = createStatsDTO(
                mean,
                variance,
                upperThreshold,
                lowerThreshold,
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined
            )

            measurementsDTO.push(
                createMeasurementsDTO(sensorMac, statsDTO, outliers)
            );

        }

        return measurementsDTO;

    } else {
        for (const sensorMac of sensorMacs) {
            const sensor = sensors.find((sensor) => sensor.macAddress === sensorMac);

            if (sensor) {
                measurements = await measurementRepository.getMeasurementsSpecificSensor(
                    networkCode,
                    sensor.gateway.macAddress,
                    sensorMac,
                    startDate,
                    endDate
                );

                const stats = calculateStats(
                    measurements.map((measurement) => measurement.value)
                );

                const { mean, variance, upperThreshold, lowerThreshold } = stats;

                const mappedMeasurementsWithOutliers = mapOutliers(
                    measurements,
                    lowerThreshold,
                    upperThreshold
                );

                const outliers = extractOnlyOutliers(mappedMeasurementsWithOutliers);

                const statsDTO = createStatsDTO(
                    mean,
                    variance,
                    upperThreshold,
                    lowerThreshold,
                    startDate ? new Date(startDate) : undefined,
                    endDate ? new Date(endDate) : undefined
                )

                measurementsDTO.push(
                    createMeasurementsDTO(sensorMac, statsDTO, outliers)
                );
            }
        }
        return measurementsDTO;
    }
}
