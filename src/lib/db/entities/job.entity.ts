import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum JobStatus {
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum JobTemplate {
  NLP = 'nlp',
  SENTIMENT = 'sentiment',
  NER = 'ner',
  CUSTOM = 'custom'
}

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  user_id: string; // User who created the job

  @Column()
  dataset_id: number; // Reference to dataset

  @Column({
    type: 'enum',
    enum: JobTemplate,
    default: JobTemplate.NLP
  })
  template: JobTemplate;

  @Column({ nullable: true })
  custom_script_url: string;

  // Training Configuration (stored as JSON)
  @Column('jsonb')
  training_config: {
    model_name: string;
    num_labels: number;
    data_format: string;
    max_length: number;
    val_split: number;
    batch_size: number;
    learning_rate: number;
    epochs: number;
    weight_decay: number;
    max_grad_norm: number;
    patience: number;
    checkpoint_dir: string;
  };

  // Success Criteria
  @Column()
  metric_type: string; // 'accuracy', 'f1', 'precision', 'recall', 'loss'

  @Column('decimal', { precision: 5, scale: 4 })
  metric_threshold: number;

  // Budget and Payment
  @Column('decimal', { precision: 10, scale: 2 })
  total_budget: number;

  @Column('decimal', { precision: 10, scale: 2 })
  compute_budget: number;

  @Column('decimal', { precision: 10, scale: 2 })
  protocol_fee: number;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.ACTIVE
  })
  status: JobStatus;

  // Results (populated when job completes)
  @Column('jsonb', { nullable: true })
  results: {
    final_metrics?: Record<string, number>;
    model_url?: string;
    logs_url?: string;
    training_time?: number;
    provider_id?: string;
  };

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  started_at: Date;

  @Column({ nullable: true })
  completed_at: Date;
}
