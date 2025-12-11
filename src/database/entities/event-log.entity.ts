import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('event_logs')
export class EventLog {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  event_type: string; // 'contact_created', 'deal_created', 'activity_created', 'webhook_received', etc.

  @Column()
  source: string; // 'hotmart', 'jelou', 'bitrix', 'system'

  @Column({ nullable: true })
  source_event: string; // PURCHASE_COMPLETE, SUBSCRIPTION_CANCELLATION, etc.

  @Column({ nullable: true })
  bitrix_contact_id: string;

  @Column({ nullable: true })
  bitrix_deal_id: string;

  @Column({ nullable: true })
  bitrix_activity_id: string;

  @Column({ nullable: true })
  customer_name: string;

  @Column({ nullable: true })
  customer_phone: string;

  @Column({ nullable: true })
  customer_email: string;

  @Column({ nullable: true })
  product_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  transaction_id: string;

  @Column()
  status: string; // 'success', 'error', 'pending'

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'text', nullable: true })
  payload: string; // JSON stringified

  @Column({ nullable: true })
  ip_address: string;

  @Column({ type: 'int', nullable: true })
  processing_time_ms: number;
}

