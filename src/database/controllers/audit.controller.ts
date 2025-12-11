import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuditService } from '../services/audit.service';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('events')
  @ApiOperation({ summary: 'Obtener todos los eventos' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, description: 'Lista de eventos' })
  async getAllEvents(
    @Query('limit') limit: string = '100',
    @Query('offset') offset: string = '0',
  ) {
    return this.auditService.getAllEvents(parseInt(limit), parseInt(offset));
  }

  @Get('events/source/:source')
  @ApiOperation({ summary: 'Obtener eventos por fuente (hotmart, jelou, bitrix)' })
  @ApiParam({ name: 'source', example: 'hotmart' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100 })
  @ApiResponse({ status: 200, description: 'Lista de eventos filtrados por fuente' })
  async getEventsBySource(
    @Param('source') source: string,
    @Query('limit') limit: string = '100',
  ) {
    return this.auditService.getEventsBySource(source, parseInt(limit));
  }

  @Get('events/type/:type')
  @ApiOperation({ summary: 'Obtener eventos por tipo' })
  @ApiParam({ name: 'type', example: 'contact_created' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100 })
  @ApiResponse({ status: 200, description: 'Lista de eventos filtrados por tipo' })
  async getEventsByType(
    @Param('type') type: string,
    @Query('limit') limit: string = '100',
  ) {
    return this.auditService.getEventsByType(type, parseInt(limit));
  }

  @Get('events/contact/:contactId')
  @ApiOperation({ summary: 'Obtener eventos de un contacto específico de Bitrix' })
  @ApiParam({ name: 'contactId', example: '12345' })
  @ApiResponse({ status: 200, description: 'Historial del contacto' })
  async getEventsByContactId(@Param('contactId') contactId: string) {
    return this.auditService.getEventsByContactId(contactId);
  }

  @Get('events/deal/:dealId')
  @ApiOperation({ summary: 'Obtener eventos de una negociación específica de Bitrix' })
  @ApiParam({ name: 'dealId', example: '67890' })
  @ApiResponse({ status: 200, description: 'Historial de la negociación' })
  async getEventsByDealId(@Param('dealId') dealId: string) {
    return this.auditService.getEventsByDealId(dealId);
  }

  @Get('events/phone/:phone')
  @ApiOperation({ summary: 'Obtener eventos de un cliente por teléfono' })
  @ApiParam({ name: 'phone', example: '+593999999999' })
  @ApiResponse({ status: 200, description: 'Historial del cliente por teléfono' })
  async getEventsByPhone(@Param('phone') phone: string) {
    return this.auditService.getEventsByPhone(phone);
  }

  @Get('events/failed')
  @ApiOperation({ summary: 'Obtener eventos con errores' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 100 })
  @ApiResponse({ status: 200, description: 'Lista de eventos fallidos' })
  async getFailedEvents(@Query('limit') limit: string = '100') {
    return this.auditService.getFailedEvents(parseInt(limit));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas generales' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del sistema',
    schema: {
      example: {
        total: 1000,
        status: {
          success: 950,
          error: 30,
          pending: 20,
        },
        by_source: [
          { source: 'hotmart', count: 500 },
          { source: 'jelou', count: 400 },
          { source: 'bitrix', count: 100 },
        ],
        by_type: [
          { event_type: 'webhook_received', count: 800 },
          { event_type: 'contact_created', count: 150 },
        ],
        today: 50,
        avg_processing_time_ms: 1234,
      },
    },
  })
  async getStats() {
    return this.auditService.getStats();
  }
}

