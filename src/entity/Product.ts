import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  ManyToMany,
  JoinTable
} from "typeorm";
import { Provider } from "./Provider";
import { Category } from "./Category";

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 50 })
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

  @Column("varchar", { length: 100, nullable: true })
  url: string;

  @Column("float")
  price: number;

  @Column("boolean", { default: false })
  deliverable: boolean;

  @ManyToOne(() => Provider, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  provider: Provider;

  @ManyToMany(type => Category, category => category.products)
  @JoinTable()
  categories: Category[];
}
