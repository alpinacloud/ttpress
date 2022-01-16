import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryColumn({ generated: false, type: 'varchar', unique: true })
  key!: string;

  @Column({ type: 'jsonb', default: {}, nullable: false })
  value!: Record<string, any>;
}
