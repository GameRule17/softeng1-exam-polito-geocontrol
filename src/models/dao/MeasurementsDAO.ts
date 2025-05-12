import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from "typeorm";
import { MeasurementDAO } from "./MeasurementDAO";
import { SensorDAO } from "./SensorDAO";

@Entity("measurements")
export class MeasurementsDAO {
    @PrimaryGeneratedColumn()
    id: number; // Auto-incrementing ID

    // STATS ??

    @OneToOne(() => SensorDAO, (sensor) => sensor.macAddress)
    sensorMacAddress: string;

    @OneToMany(() => MeasurementDAO, (measurement) => measurement.measurements)
    measurements: MeasurementDAO[];
}