
import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { MeasurementDAO } from "@dao/MeasurementDAO";
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
      relations: ["network", "sensors"],
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
      relations: ["gateway","gateway.sensors"],
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
    description?: string,
    variable?: string,
    unit?: string,
  ): Promise<SensorDAO> {
    const gateway = await this.loadGatewayOrThrow(networkCode, gatewayMac);
    const sensors = await this.repo.find({
      where: { macAddress: sensorMac, gateway },
      relations: ["gateway","gateway.sensors"],
    });
    throwConflictIfFound(
      sensors,
      () => sensors.length > 0,
      `Sensor '${sensorMac}' already exists in gateway '${gatewayMac}'`
    );

    const sensor = this.repo.create({ macAddress: sensorMac, name, description, gateway, variable,unit });
    return this.repo.save(sensor);
  }

  

  async updateSensor(
    networkCode: string,
    gatewayMac: string,
    sensorMac: string,
    data: { macAddress?:string,name?: string; description?: string; variable?: string; unit?: string }
  ): Promise<SensorDAO> {
    const sensor = await this.loadSensorOrThrow(networkCode, gatewayMac, sensorMac);
    if (data.macAddress && data.macAddress !== sensor.macAddress) {
      throwConflictIfFound(
        await this.repo.find({
          where: { macAddress: data.macAddress, gateway: sensor.gateway },
          relations: ["gateway","gateway.sensors"],
        }),
        () => true,
        `Sensor '${data.macAddress}' already exists in gateway '${gatewayMac}'`
      )
    }
    if (data.macAddress !== undefined) sensor.macAddress = data.macAddress;
    if (data.name !== undefined) sensor.name = data.name;
    if (data.description !== undefined) sensor.description = data.description;
    if (data.variable !== undefined) sensor.variable = data.variable;
    if (data.unit !== undefined) sensor.unit = data.unit;

    return this.repo.save(sensor);
  }



  async deleteSensor(networkCode: string, gatewayMac: string, sensorMac: string): Promise<void> {
    const sensor = await this.loadSensorOrThrow(networkCode, gatewayMac, sensorMac);
    await this.repo.remove(sensor);
  }
}