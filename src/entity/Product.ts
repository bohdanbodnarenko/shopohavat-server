import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  BeforeInsert
} from "typeorm";

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 50, unique: true })
  name: string;

  @Column("text", { nullable: true })
  ingredients: string;

  @Column("int", { nullable: true })
  weight: number;

  @Column("int", { nullable: true })
  volume: number;

  @Column("int", { nullable: true })
  count: number;

  @Column("text", { nullable: true })
  description: string;

  @Column("varchar", { length: 100 })
  url: string;

  @Column("float")
  price: number;

  @Column("boolean", { default: false })
  deliverable: boolean;
}
