import { Brands } from 'src/brand/brand.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  INFLUENCER = 'influencer',
  BRAND_MANAGER = 'brandmanager',
}

@Entity()
@Unique(['email'])
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.INFLUENCER,
  })
  role: UserRole;

  @ManyToOne(() => Brands, { nullable: true })
  brand: Brands;

  @CreateDateColumn()
  ceratedAt: number;

  @UpdateDateColumn()
  updatedAt: number;
}
