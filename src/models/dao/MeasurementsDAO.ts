import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from "typeorm";
import { MeasurementDAO } from "./MeasurementDAO";
import { SensorDAO } from "./SensorDAO";
import { on } from "events";

@Entity("measurements")
export class MeasurementsDAO {
    @PrimaryGeneratedColumn()
    id: number; // Auto-incrementing ID

    // STATS ??

    @OneToOne(() => SensorDAO, (sensor) => sensor.macAddress)
    sensorMacAddress: string;

    @OneToMany(() => MeasurementDAO, (measurement) => measurement.measurements, { onDelete: 'CASCADE' })
    measurements: MeasurementDAO[];
}