import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  BeforeInsert,
  OneToMany,
  ManyToMany,
  JoinTable
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { Product } from "./Product";
import { Delivery } from "./Delivery";

@Entity()
export class Provider extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 255, unique: true })
  email: string;

  @Column("text")
  password: string;

  @Column("varchar", { length: 50 })
  name: string;

  @Column("boolean", { default: false })
  confirmed: boolean;

  @Column("boolean", { default: false })
  forgotPasswordLocked: boolean;

  @Column("text", { array: true })
  phones: string[];

  @Column("text", { unique: true, nullable: true })
  site: String;

  @Column("text", { nullable: true })
  description: string;

  @Column("varchar", { length: 10, nullable: true })
  openTime: string;

  @Column("varchar", { length: 10, nullable: true })
  closeTime: String;

  @Column("varchar", { length: 50, nullable: true })
  address: String;

  @Column("text", { nullable: true })
  promos: string;

  @OneToMany(() => Product, product => product.provider)
  products: Product[];

  @ManyToMany(type => Delivery, delivery => delivery.providers)
  deliveries: Delivery[];

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
