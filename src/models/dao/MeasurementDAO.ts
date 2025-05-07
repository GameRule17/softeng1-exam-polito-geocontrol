import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { SensorDAO } from "./SensorDAO";

@Entity("measurement")
export class MeasurementDAO {
  @PrimaryGeneratedColumn()
  id: number; // Auto-incrementing ID

  @Column({ nullable: false })
  createdAt: string;
  // WARNING: Non utilizzabile come chiave primaria, ci sarà un test su questo

  @Column({ nullable: false })
  value: number;

  @Column({ nullable: false })
  isOutlier: boolean;

  @ManyToOne(() => SensorDAO, sensor => sensor.measurements)
  sensor: SensorDAO;
}
