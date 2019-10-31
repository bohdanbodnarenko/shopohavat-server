import {
  BaseEntity,
  Column,
  Entity, JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import {Category} from "./Category";
import {Provider} from "./Provider";

@Entity()
export class Delivery extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 50, unique: true })
  name: string;

  @Column("varchar", { length: 100, array: true })
  phones: string[];

  @Column("varchar", { length: 20, nullable: true })
  openTime: string;

  @Column("varchar", { length: 20, nullable: true })
  closeTime: string;

  @Column("int", { nullable: true })
  minForFree: number;

  @Column("text", { nullable: true })
  description: string;

  @Column("text", { array: true })
  promos: [string];

  @ManyToMany(type => Provider, provider => provider.deliveries)
  @JoinTable()
  providers: Provider[];
}
