

import { AppDataSource } from "@database";

import { NetworkDAO } from "@dao/NetworkDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { SensorDAO } from "@dao/SensorDAO";
import { MeasurementDAO } from "@dao/MeasurementDAO";


import { Measurements } from "@dto/Measurements";
import { Measurement } from "@dto/Measurement";
import { Stats } from "@dto/Stats";

export class NetworkRepository {



  async getAllNetworks(): Promise<NetworkDAO[]> {
    return AppDataSource.getRepository(NetworkDAO).find();
  }


  async getNetworkByCode(code: string): Promise<NetworkDAO | null> {
    return AppDataSource.getRepository(NetworkDAO).findOneBy({ code }) ?? null;
  }


  async createNetwork(data: Partial<NetworkDAO>): Promise<NetworkDAO> {
    const repo = AppDataSource.getRepository(NetworkDAO);
    const entity = repo.create(data);
    return repo.save(entity);
  }


  async updateNetwork(code: string, data: Partial<NetworkDAO>): Promise<NetworkDAO | null> {
    const repo = AppDataSource.getRepository(NetworkDAO);

    const existing = await repo.findOneBy({ code });
    if (!existing) return null;

    repo.merge(existing, data);
    return repo.save(existing);
  }

  async deleteNetwork(code: string): Promise<boolean> {
    const result = await AppDataSource.getRepository(NetworkDAO).delete({ code });
    return result.affected !== undefined && result.affected > 0;
  }

 
  async retrieveMeasurementsForNetwork(
    code: string,
    startDate: Date,
    endDate: Date
  ): Promise<MeasurementDAO[]> {
    return AppDataSource.getRepository(MeasurementDAO)
      .createQueryBuilder("m")
      .innerJoin("m.sensor", "s")
      .innerJoin("s.gateway", "g")
      .innerJoin("g.network", "n")
      .where("n.code = :code", { code })
      .andWhere("m.createdAt BETWEEN :from AND :to", { from: startDate, to: endDate })
      .getMany();
  }


  async retrieveStats(
    code: string,
    startDate: Date,
    endDate: Date
  ): Promise<Stats> {
    const raw = await this.retrieveMeasurementsForNetwork(code, startDate, endDate);
    return this._computeStats(raw.map(r => r.value), startDate, endDate);
  }

  async retrieveOutliersForNetwork(
    code: string,
    startDate: Date,
    endDate: Date
  ): Promise<Measurements[]> {
    

    const sensors = await AppDataSource.getRepository(SensorDAO)
      .createQueryBuilder("s")
      .innerJoin("s.gateway", "g")
      .innerJoin("g.network", "n")
      .where("n.code = :code", { code })
      .getMany();

    
    const outliersList: Measurements[] = [];

    for (const sensor of sensors) {
      const dto = await this.retrieveOutliersForSensor(
        code,
        sensor.macAddress,
        startDate,
        endDate
      );

      if (dto.measurements.length > 0) {
        outliersList.push(dto);
      }
    }

    return outliersList;
  }


  async retrieveOutliersForSensor(
    networkCode: string,
    sensorMac: string,
    startDate: Date,
    endDate: Date
  ): Promise<Measurements> {
    
    const raw = await AppDataSource.getRepository(MeasurementDAO)
      .createQueryBuilder("m")
      .innerJoin("m.sensor", "s")
      .innerJoin("s.gateway", "g")
      .innerJoin("g.network", "n")
      .where("n.code = :code", { code: networkCode })
      .andWhere("s.macAddress = :mac", { mac: sensorMac })
      .andWhere("m.createdAt BETWEEN :from AND :to", { from: startDate, to: endDate })
      .getMany();

    const values = raw.map(r => r.value);
    const stats = this._computeStats(values, startDate, endDate);

   
    const upper = stats.mean + 2 * Math.sqrt(stats.variance);
    const lower = stats.mean - 2 * Math.sqrt(stats.variance);

    
    const outlierDtos: Measurement[] = raw
      .filter(m => m.value > upper || m.value < lower)
      .map(m => ({
        createdAt: m.createdAt,
        value: m.value,
        isOutlier: true,
      }));

    return {
      sensorMacAddress: sensorMac,
      stats: { ...stats, upperThreshold: upper, lowerThreshold: lower },
      measurements: outlierDtos,
    } as Measurements;
  }

  
  private _computeStats(values: number[], start: Date, end: Date): Stats {
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
    const variance =
      values.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / values.length;

    return {
      startDate: start,
      endDate: end,
      mean,
      variance,
      // thresholds filled by caller (retrieveOutliersForSensor)
      upperThreshold: mean,
      lowerThreshold: mean,
    } as Stats;
  }
}
