import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { GatewayDAO } from "./GatewayDAO";

@Entity("networks")
export class NetworkDAO {
  @PrimaryColumn({ nullable: false })
  code: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => GatewayDAO, gateway => gateway.network)
  gateways?: GatewayDAO[];
}
