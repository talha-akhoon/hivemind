import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Dataset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  domain: string;

  @Column()
  data_source: string;

  @Column()
  collection_method: string;

  @Column()
  license: string;

  @Column({ nullable: true })
  price: string;

  @Column({ nullable: true })
  tags: string;

  @Column({ nullable: true })
  train_file_url: string;

  @Column({ nullable: true })
  test_file_url: string;

  @Column({ nullable: true })
  validation_file_url: string;

  @Column({ nullable: true })
  additional_files_url: string;

  // Sample file URLs (public)
  @Column({ nullable: true })
  train_file_sample_url: string;

  @Column({ nullable: true })
  test_file_sample_url: string;

  // Sample metadata
  @Column({ type: 'json', nullable: true })
  sample_metadata: object;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  owner_wallet: string; // Added wallet field

  @Column({ nullable: true })
  token_id: string;

  @CreateDateColumn()
  created_at: Date;
}
