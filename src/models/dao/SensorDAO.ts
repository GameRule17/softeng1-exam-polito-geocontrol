import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { GatewayDAO } from "./GatewayDAO";
import { MeasurementDAO } from "./MeasurementDAO";

@Entity("sensors")
export class SensorDAO {
  @PrimaryColumn({ nullable: false })
  macAddress: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  variable?: string;

  @Column({ nullable: true })
  unit?: string;

  @ManyToOne(() => GatewayDAO, gateway => gateway.sensors)
  gateway: GatewayDAO;

  @OneToMany(() => MeasurementDAO, measurement => measurement.sensor)
  measurements?: MeasurementDAO[];
}
