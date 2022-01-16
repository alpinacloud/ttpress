import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Post } from './post';

export enum PermissionType {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN'
}

@Entity()
export class Editor {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ type: 'varchar', default: null })
  name!: string;

  @Column({ type: 'varchar', nullable: false })
  username!: string;

  @Column({ type: 'text', nullable: false })
  pwd!: string;

  @Column({ type: 'enum', enum: PermissionType, default: PermissionType.ADMIN })
  permissionType!: PermissionType;

  @OneToMany(type => Post, post => post.author)
  posts!: Post[];

  @CreateDateColumn()
  createdAt!: Date;

  @CreateDateColumn()
  updatedAt!: Date;
}
