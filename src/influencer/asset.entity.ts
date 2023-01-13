import { Users } from 'src/auth/user.entity';
import { Brands } from 'src/brand/brand.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AssetStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class Assets {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  internalFileName: string;

  @ManyToOne(() => Users, { nullable: false })
  author: Users;

  @Column({
    type: 'simple-enum',
    enum: AssetStatus,
    default: AssetStatus.PENDING,
  })
  status: AssetStatus;

  @ManyToOne(() => Brands, { nullable: true })
  assignedBrand: Brands;

  @CreateDateColumn()
  createdAt: number;

  @UpdateDateColumn()
  updatedAt: number;
}
