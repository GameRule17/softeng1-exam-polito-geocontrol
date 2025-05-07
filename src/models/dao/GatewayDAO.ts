import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { NetworkDAO } from "./NetworkDAO";
import { SensorDAO } from "./SensorDAO";

@Entity("gateways")
export class GatewayDAO {
  @PrimaryColumn({ nullable: false })
  macAddress: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => NetworkDAO, network => network.gateways)
  network: NetworkDAO;

  @OneToMany(() => SensorDAO, sensor => sensor.gateway)
  sensors?: SensorDAO[];
}
