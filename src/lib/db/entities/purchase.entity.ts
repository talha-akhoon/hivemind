import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string; // Reference to the user who made the purchase

  @Column()
  dataset_id: string;

  @Column()
  buyer_wallet: string;

  @Column()
  seller_wallet: string;

  @Column()
  token_id: string;

  @Column('decimal', { precision: 18, scale: 8 })
  price_paid: number;

  @Column()
  payment_tx_id: string;

  @Column()
  mint_tx_id: string;

  @Column()
  transfer_tx_id: string;

  @Column({ default: 'completed' })
  status: 'pending' | 'completed' | 'failed' | 'refunded';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Optional: Add metadata for additional purchase information
  @Column('jsonb', { nullable: true })
  metadata?: {
    platform_fee?: number;
    seller_amount?: number;
    network?: 'testnet' | 'mainnet';
    [key: string]: any;
  };
}

// Type for creating a new purchase (without generated fields)
export type CreatePurchaseDto = {
  user_id: string; // Added user_id
  dataset_id: string;
  buyer_wallet: string;
  seller_wallet: string;
  token_id: string;
  price_paid: number;
  payment_tx_id: string;
  mint_tx_id: string;
  transfer_tx_id: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata?: {
    platform_fee?: number;
    seller_amount?: number;
    network?: 'testnet' | 'mainnet';
    [key: string]: any;
  };
};

// Type for purchase responses/queries
export type PurchaseResponse = Purchase;

// Type for purchase verification
export type PaymentVerification = {
  isValid: boolean;
  transactionExists: boolean;
  amountMatches: boolean;
  recipientCorrect: boolean;
  isRecent: boolean;
  isUnused: boolean;
  errorReason?: string;
};
