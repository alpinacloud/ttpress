import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Editor } from './editor';

export enum PostState {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ type: 'varchar', nullable: false })
  title!: string;

  @Column({ type: 'text', default: '' })
  subtitle!: string;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @Column({ type: 'enum', enum: PostState, default: PostState.DRAFT })
  state!: PostState;

  @Column({ type: 'varchar', nullable: true })
  coverImage!: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  slug!: string;

  @ManyToOne(type => Editor, editor => editor.posts)
  author!: Editor;

  @CreateDateColumn()
  createdAt!: Date;

  @CreateDateColumn()
  updatedAt!: Date;
}
