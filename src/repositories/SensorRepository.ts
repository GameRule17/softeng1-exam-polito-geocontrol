
import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { Measurements } from "@models/dto/Measurements";
import { Measurement } from "@models/dto/Measurement";
import { Stats } from "@models/dto/Stats";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class SensorRepository {
  private repo: Repository<SensorDAO>;
  private gatewayRepo: Repository<GatewayDAO>;
  private measurementRepo: Repository<MeasurementDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(SensorDAO);
    this.gatewayRepo = AppDataSource.getRepository(GatewayDAO);
    this.measurementRepo = AppDataSource.getRepository(MeasurementDAO);
  }

  

  private async loadGatewayOrThrow(networkCode: string, gatewayMac: string): Promise<GatewayDAO> {
    const gateways = await this.gatewayRepo.find({
      where: { macAddress: gatewayMac, network: { code: networkCode } },
      relations: ["network"],
    });
    return findOrThrowNotFound(
      gateways,
      () => gateways.length > 0,
      `Gateway '${gatewayMac}' not found in network '${networkCode}'`
    );
  }

  private async loadSensorOrThrow(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string
  ): Promise<SensorDAO> {
    const sensors = await this.repo.find({
      where: {
        macAddress: sensorMac,
        gateway: { macAddress: gatewayMac, network: { code: networkCode } },
      },
      relations: ["gateway", "gateway.network"],
    });

    return findOrThrowNotFound(
      sensors,
      () => sensors.length > 0,
      `Sensor '${sensorMac}' not found in gateway '${gatewayMac}' / network '${networkCode}'`
    );
  }



  async findByGateway(networkCode: string, gatewayMac: string): Promise<SensorDAO[]> {
    await this.loadGatewayOrThrow(networkCode, gatewayMac);
    return this.repo.find({
      where: { gateway: { macAddress: gatewayMac, network: { code: networkCode } } },
      relations: ["gateway"],
    });
  }

  async getSensorByMac(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string
  ): Promise<SensorDAO> {
    return this.loadSensorOrThrow(networkCode, gatewayMac, sensorMac);
  }

 

  async createSensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    name?: string,
    description?: string
  ): Promise<SensorDAO> {
    const gateway = await this.loadGatewayOrThrow(networkCode, gatewayMac);
    const sensors = await this.repo.find({
      where: { macAddress: sensorMac, gateway },
      relations: ["gateway"],
    });
    throwConflictIfFound(
      sensors,
      () => sensors.length > 0,
      `Sensor '${sensorMac}' already exists in gateway '${gatewayMac}'`
    );

    const sensor = this.repo.create({ macAddress: sensorMac, name, description, gateway });
    return this.repo.save(sensor);
  }

  

  async updateSensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    data: { name?: string; description?: string }
  ): Promise<SensorDAO> {
    const sensor = await this.loadSensorOrThrow(networkCode, gatewayMac, sensorMac);

    if (data.name !== undefined) sensor.name = data.name;
    if (data.description !== undefined) sensor.description = data.description;

    return this.repo.save(sensor);
  }



  async deleteSensor(networkCode: string, gatewayMac: string, sensorMac: string): Promise<void> {
    const sensor = await this.loadSensorOrThrow(networkCode, gatewayMac, sensorMac);
    await this.repo.remove(sensor);
  }


  async storeMeasurement(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    value: number,
    createdAt: Date = new Date(),
    isOutlier = false
  ): Promise<MeasurementDAO> {
    const sensor = await this.loadSensorOrThrow(networkCode, gatewayMac, sensorMac);

    const measurement = this.measurementRepo.create({
      value,
      createdAt,
      isOutlier,
      sensor,
    });

    return this.measurementRepo.save(measurement);
  }

  async retrieveMeasurements(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    from: Date,
    to: Date
  ): Promise<MeasurementDAO[]> {
    await this.loadSensorOrThrow(networkCode, gatewayMac, sensorMac);

    return this.measurementRepo.find({
      where: {
        sensor: { macAddress: sensorMac },
        createdAt: { $gte: from, $lte: to } as any, // TypeORM 0.3 uses Between, ma per brevità
      },
      relations: ["sensor"],
    });
  }

  async retrieveStats(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    from: Date,
    to: Date
  ): Promise<Stats> {
    const raw = await this.retrieveMeasurements(networkCode, gatewayMac, sensorMac, from, to);
    return this.computeStats(raw.map(r => r.value), from, to);
  }

  async retrieveOutliers(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    from: Date,
    to: Date
  ): Promise<Measurements> {
    const raw = await this.retrieveMeasurements(networkCode, gatewayMac, sensorMac, from, to);
    const stats = this.computeStats(raw.map(r => r.value), from, to);

    const upper = stats.mean + 2 * Math.sqrt(stats.variance);
    const lower = stats.mean - 2 * Math.sqrt(stats.variance);

    const outlierDtos: Measurement[] = raw
      .filter(m => m.value > upper || m.value < lower)
      .map(m => ({ createdAt: m.createdAt, value: m.value, isOutlier: true }));

    return {
      sensorMacAddress: sensorMac,
      stats: { ...stats, upperThreshold: upper, lowerThreshold: lower },
      measurements: outlierDtos,
    } as Measurements;
  }

  

  private computeStats(values: number[], start: Date, end: Date): Stats {
    if (values.length === 0) {
      return {
        startDate: start,
        endDate: end,
        mean: 0,
        variance: 0,
        upperThreshold: 0,
        lowerThreshold: 0,
      } as Stats;
    }

    const mean = values.reduce((a, v) => a + v, 0) / values.length;
    const variance = values.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / values.length;

    return {
      startDate: start,
      endDate: end,
      mean,
      variance,
      upperThreshold: mean,
      lowerThreshold: mean,
    } as Stats;
  }
}
