import { Repository } from "typeorm";

import { AppDataSource } from "@database";

import { NetworkDAO } from "@dao/NetworkDAO";

import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { SensorDAO } from "@models/dao/SensorDAO";

export class NetworkRepository {
  private repo: Repository<NetworkDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(NetworkDAO);
  }

  async getAllNetworks(): Promise<NetworkDAO[]> {
    return this.repo.find({
      relations: ["gateways", "gateways.sensors"]
    });
  }

  async createNetwork(
    code: string,
    name: string,
    description: string
  ): Promise<NetworkDAO> {
    throwConflictIfFound(
      await this.repo.find({ where: { code } }),
      () => true,
      `Network with code '${code}' already exists`
    );

    return this.repo.save({
      code: code,
      name: name,
      description: description
    });
  }

  async getNetworkByCode(code: string): Promise<NetworkDAO> {
    return findOrThrowNotFound(
      await this.repo.find({ where: { code }, relations: ["gateways", "gateways.sensors"] }),
      () => true,
      `Network with code '${code}' not found`
    );
  }

  async updateNetwork(
    code: string,
    newCode: string,
    name: string,
    description: string
  ): Promise<NetworkDAO> {

    const network = await this.getNetworkByCode(code);

    network.code = newCode;
    network.name = name;
    network.description = description;

    return this.repo.save(network);
  }

  async deleteNetwork(code: string): Promise<boolean> {
    const result = await AppDataSource.getRepository(NetworkDAO).delete({ code });
    return result.affected !== undefined && result.affected > 0;
  }

  async getAllSensorsOfNetwork(
    networkCode: string,
  ): Promise<SensorDAO[]> {
    const sensorRepo = AppDataSource.getRepository(SensorDAO);
    return sensorRepo
      .createQueryBuilder("sensor")
      .leftJoinAndSelect("sensor.gateway", "gateway")
      .leftJoinAndSelect("gateway.network", "network")
      .where("network.code = :networkCode", { networkCode })
      .getMany();
  }

}
