//MeasurementRepository.ts

import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@dao/NetworkDAO";

import { Measurement } from "@dto/Measurement";
import { AppError } from "@models/errors/AppError";
import { findOrThrowNotFound } from "@utils";

export class MeasurementRepository {
  private repo: Repository<MeasurementDAO>;
  private sensorRepo: Repository<SensorDAO>;
  private gatewayRepo: Repository<GatewayDAO>;
  private networkRepo: Repository<NetworkDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
    this.sensorRepo = AppDataSource.getRepository(SensorDAO);
    this.gatewayRepo = AppDataSource.getRepository(GatewayDAO);
    this.networkRepo = AppDataSource.getRepository(NetworkDAO);
  }

  private async loadSensorOrThrow(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string
  ): Promise<SensorDAO> {
    const sensors = await this.sensorRepo.find({
      where: {
        macAddress: sensorMac,
        gateway: {
          macAddress: gatewayMac,
          network: { code: networkCode },
        },
      },
      relations: ["gateway", "gateway.network", "measurements"],
    });

    return findOrThrowNotFound(
      sensors,
      () => sensors.length > 0,
      `Sensor '${sensorMac}' not found in gateway '${gatewayMac}' / network '${networkCode}'`
    );
  }

  async getSensorMeasurements(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string
  ): Promise<Measurement[]> {
    await this.loadSensorOrThrow(networkCode, gatewayMac, sensorMac);

    const measurements = await this.repo.find({
      where: { sensor: { macAddress: sensorMac } },
      relations: ["sensor", "sensor.measurements"],
      order: { createdAt: "ASC" },
    });

    return measurements.map((m) => ({
      createdAt: m.createdAt,
      value: m.value,
      isOutlier: m.isOutlier,
    }));
  }

  async storeMeasurements(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    dtos: Measurement[]
  ): Promise<void> {
    const sensor = await this.loadSensorOrThrow(networkCode, gatewayMac, sensorMac);

    const entities = dtos.map((dto) =>
      this.repo.create({
        sensor,
        createdAt: new Date(dto.createdAt),
        value: dto.value,
        isOutlier: dto.isOutlier ?? false,
      })
    );

    await this.repo.save(entities);
  }

  async getMeasurement(id: number): Promise<Measurement> {
    const found = await this.repo.findOne({ where: { id }, relations: ["sensor", "sensor.measurements"] });
    if (!found) throw new AppError(`Measurement ${id} not found`, 404);

    return {
      createdAt: found.createdAt,
      value: found.value,
      isOutlier: found.isOutlier,
    };
  }

  async updateMeasurement(id: number, dto: Measurement): Promise<void> {
    const found = await this.repo.findOne({ where: { id }, relations: ["sensor", "sensor.measurements"] });
    if (!found) throw new AppError(`Measurement ${id} not found`, 404);

    found.createdAt = new Date(dto.createdAt);
    found.value = dto.value;
    found.isOutlier = dto.isOutlier ?? false;

    await this.repo.save(found);
  }

  async deleteMeasurement(id: number): Promise<void> {
    const found = await this.repo.findOne({ where: { id }, relations: ["sensor", "sensor.measurements"] });
    if (!found) throw new AppError(`Measurement ${id} not found`, 404);

    await this.repo.remove(found);
  }

  async getAllMeasurements(sensorMac: string): Promise<MeasurementDAO[]> {
    return this.repo.find({
      where: { sensor: { macAddress: sensorMac } },
      relations: ["sensor", "sensor.measurements"],
    });
  }

  async getNetworkMeasurements(networkCode: string): Promise<Measurement[]> {
    const networks = await this.networkRepo.find({ where: { code: networkCode }, relations: ["gateways", "gateways.sensors", "gateways.sensors.measurements"] });
    const network = findOrThrowNotFound(
      networks,
      () => networks.length > 0,
      `Network '${networkCode}' not found`
    );

    const measurements = await this.repo
      .createQueryBuilder("m")
      .innerJoin("m.sensor", "s")
      .innerJoin("s.gateway", "g")
      .innerJoin("g.network", "n")
      .where("n.code = :code", { code: networkCode })
      .orderBy("m.createdAt", "ASC")
      .getMany();

    return measurements.map((m) => ({
      createdAt: m.createdAt,
      value: m.value,
      isOutlier: m.isOutlier,
    }));
  }
}
