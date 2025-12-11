import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { EventLog } from '../entities/event-log.entity';

export interface CreateEventLogDto {
  event_type: string;
  source: string;
  source_event?: string;
  bitrix_contact_id?: string;
  bitrix_deal_id?: string;
  bitrix_activity_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  product_name?: string;
  amount?: number;
  currency?: string;
  transaction_id?: string;
  status: 'success' | 'error' | 'pending';
  error_message?: string;
  payload?: any;
  ip_address?: string;
  processing_time_ms?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
  ) {}

  /**
   * Registrar un evento en la base de datos
   */
  async logEvent(data: CreateEventLogDto): Promise<EventLog> {
    try {
      const eventLog = this.eventLogRepository.create({
        ...data,
        payload: data.payload ? JSON.stringify(data.payload) : undefined,
      });

      const saved = await this.eventLogRepository.save(eventLog);
      this.logger.log(`Evento registrado: ${data.event_type} [${data.source}] - ID: ${saved.id}`);
      
      return saved;
    } catch (error) {
      this.logger.error(`Error registrando evento: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener todos los eventos
   */
  async getAllEvents(limit: number = 100, offset: number = 0): Promise<EventLog[]> {
    return this.eventLogRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Obtener eventos por fuente (hotmart, jelou, bitrix)
   */
  async getEventsBySource(source: string, limit: number = 100): Promise<EventLog[]> {
    return this.eventLogRepository.find({
      where: { source },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtener eventos por tipo
   */
  async getEventsByType(event_type: string, limit: number = 100): Promise<EventLog[]> {
    return this.eventLogRepository.find({
      where: { event_type },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtener eventos por ID de contacto de Bitrix
   */
  async getEventsByContactId(contactId: string): Promise<EventLog[]> {
    return this.eventLogRepository.find({
      where: { bitrix_contact_id: contactId },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Obtener eventos por ID de negociación de Bitrix
   */
  async getEventsByDealId(dealId: string): Promise<EventLog[]> {
    return this.eventLogRepository.find({
      where: { bitrix_deal_id: dealId },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Obtener eventos por teléfono del cliente
   */
  async getEventsByPhone(phone: string): Promise<EventLog[]> {
    return this.eventLogRepository.find({
      where: { customer_phone: phone },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Obtener eventos en un rango de fechas
   */
  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<EventLog[]> {
    return this.eventLogRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Obtener eventos con errores
   */
  async getFailedEvents(limit: number = 100): Promise<EventLog[]> {
    return this.eventLogRepository.find({
      where: { status: 'error' },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtener estadísticas
   */
  async getStats(): Promise<any> {
    const total = await this.eventLogRepository.count();
    const success = await this.eventLogRepository.count({ where: { status: 'success' } });
    const error = await this.eventLogRepository.count({ where: { status: 'error' } });
    const pending = await this.eventLogRepository.count({ where: { status: 'pending' } });

    const bySource = await this.eventLogRepository
      .createQueryBuilder('event')
      .select('event.source')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.source')
      .getRawMany();

    const byType = await this.eventLogRepository
      .createQueryBuilder('event')
      .select('event.event_type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.event_type')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Eventos de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.eventLogRepository.count({
      where: {
        timestamp: MoreThanOrEqual(today),
      },
    });

    // Promedio de tiempo de procesamiento
    const avgProcessingTime = await this.eventLogRepository
      .createQueryBuilder('event')
      .select('AVG(event.processing_time_ms)', 'avg')
      .where('event.processing_time_ms IS NOT NULL')
      .getRawOne();

    return {
      total,
      status: {
        success,
        error,
        pending,
      },
      by_source: bySource,
      by_type: byType,
      today: todayCount,
      avg_processing_time_ms: avgProcessingTime?.avg || 0,
    };
  }

  /**
   * Limpiar eventos antiguos (más de X días)
   */
  async cleanOldEvents(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.eventLogRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp < :cutoffDate', { cutoffDate })
      .execute();

    this.logger.log(`Limpiados ${result.affected} eventos antiguos (más de ${daysToKeep} días)`);
    return result.affected || 0;
  }
}

