import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { MeasurementsDAO } from "./MeasurementsDAO";

@Entity("measurement")
export class MeasurementDAO {
  @PrimaryGeneratedColumn()
  id: number; // Auto-incrementing ID

  @Column({ nullable: false })
  createdAt: Date;

  @Column({ nullable: false })
  value: number;

  @Column({ nullable: true })
  isOutlier?: boolean;

  @ManyToOne(() => MeasurementsDAO, (measurementsDAO) => measurementsDAO.measurements,{onDelete: 'CASCADE'})
  measurements: MeasurementsDAO;
}
