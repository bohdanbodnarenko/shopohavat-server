import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Product } from "./Product";

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 50, unique: true })
  name: string;

  @ManyToMany(type => Product, product => product.categories)
  products: Product[];
}
