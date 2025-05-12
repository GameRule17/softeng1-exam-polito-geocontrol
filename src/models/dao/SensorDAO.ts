import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GatewayDAO } from "./GatewayDAO";

@Entity("sensors")
export class SensorDAO {
  @PrimaryGeneratedColumn()
  id: number; // Auto-incrementing ID

  @Column({ nullable: false })
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
}
