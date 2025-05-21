import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { SensorDAO } from "@dao/SensorDAO";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class MeasurementRepository {
    private repo: Repository<MeasurementDAO>;

    constructor() {
        this.repo = AppDataSource.getRepository(MeasurementDAO);
    }

    async getMeasurementsSpecificSensor(
        networkCode: string,
        gatewayMac: string,
        sensorMac: string,
        startDate?: string,
        endDate?: string
    ): Promise<MeasurementDAO[]> {
        const query = this.repo.createQueryBuilder("measurement")
            .innerJoin("measurement.sensor", "sensor")
            .innerJoin("sensor.gateway", "gateway")
            .innerJoin("gateway.network", "network")
            .where("sensor.macAddress = :sensorMac", { sensorMac })
            .andWhere("gateway.macAddress = :gatewayMac", { gatewayMac })
            .andWhere("network.code = :networkCode", { networkCode })
            .orderBy("measurement.createdAt", "ASC");

        if (startDate) {
            query.andWhere("measurement.createdAt >= :startDate", { startDate });
        }

        if (endDate) {
            query.andWhere("measurement.createdAt <= :endDate", { endDate });
        }

        return await query.getMany();
    }

    async storeMeasurementForASensor(
        networkCode: string,
        gatewayMac: string,
        sensorMac: string,
        measurement: MeasurementDTO[]
    ): Promise<MeasurementDAO[]> {
        const sensorRepo = AppDataSource.getRepository(SensorDAO);

        const sensor = await sensorRepo
            .createQueryBuilder("sensor")
            .innerJoinAndSelect("sensor.gateway", "gateway")
            .innerJoinAndSelect("gateway.network", "network")
            .where("sensor.macAddress = :sensorMac", { sensorMac })
            .andWhere("gateway.macAddress = :gatewayMac", { gatewayMac })
            .andWhere("network.code = :networkCode", { networkCode })
            .getOne();

        if (!sensor) {
            throw new Error(`Sensor with MAC address ${sensorMac} not found`);
        }
        
        const measurementsToSave = measurement.map(m => ({
            ...m,
            sensor
        }));
        return await this.repo.save(measurementsToSave);
    }
}