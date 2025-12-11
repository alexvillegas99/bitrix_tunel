import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLog } from './entities/event-log.entity';
import { AuditService } from './services/audit.service';
import { AuditController } from './controllers/audit.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/bitrix_tunnel.db',
      entities: [EventLog],
      synchronize: true, // Auto-crear tablas (solo desarrollo, en producción usar migraciones)
      logging: false,
    }),
    TypeOrmModule.forFeature([EventLog]),
  ],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService, TypeOrmModule],
})
export class DatabaseModule {}

