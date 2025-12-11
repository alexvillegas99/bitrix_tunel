import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { BitrixService } from './bitrix.service';

@ApiTags('Bitrix')
@Controller('bitrix')
export class BitrixController {
  constructor(private readonly bitrixService: BitrixService) {}

  @Post('tarea/crear')
  @ApiOperation({ 
    summary: 'Crear una tarea en Bitrix24',
    description: 'Crea una tarea y opcionalmente la vincula con una negociación o contacto'
  })
  @ApiBody({
    description: 'Datos de la tarea a crear',
    schema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', example: 'Seguimiento de cliente' },
        description: { type: 'string', example: 'Contactar al cliente para confirmar la compra' },
        responsibleId: { type: 'number', example: 138 },
        deadline: { type: 'string', example: '2024-12-31 18:00:00' },
        priority: { type: 'number', example: 2, description: '1=Baja, 2=Normal, 3=Alta' },
        dealId: { type: 'number', example: 13224 },
        contactId: { type: 'number', example: 10795 },
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarea creada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Tarea creada exitosamente',
        taskId: 12345
      }
    }
  })
  async crearTarea(@Body() body: {
    title: string;
    description?: string;
    responsibleId?: number;
    deadline?: string;
    priority?: number;
    dealId?: number;
    contactId?: number;
  }) {
    try {
      const taskId = await this.bitrixService.crearTarea(body);
      
      return {
        success: true,
        message: 'Tarea creada exitosamente',
        taskId,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear la tarea',
        error: error.message,
      };
    }
  }

  @Post('tarea/crear-para-deal/:dealId')
  @ApiOperation({ 
    summary: 'Crear tarea para una negociación específica',
    description: 'Crea una tarea vinculada a un Deal ID de Bitrix'
  })
  @ApiBody({
    description: 'Datos de la tarea',
    schema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', example: 'Seguimiento post-compra' },
        description: { type: 'string', example: 'Verificar satisfacción del cliente' },
        deadline: { type: 'string', example: '2024-12-31 18:00:00' },
      }
    }
  })
  async crearTareaParaDeal(
    @Param('dealId') dealId: string,
    @Body() body: {
      title: string;
      description?: string;
      deadline?: string;
    }
  ) {
    try {
      const taskId = await this.bitrixService.crearTareaParaNegociacion(
        parseInt(dealId),
        body.title,
        body.description,
        body.deadline,
      );
      
      return {
        success: true,
        message: 'Tarea creada para la negociación',
        taskId,
        dealId: parseInt(dealId),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear la tarea',
        error: error.message,
      };
    }
  }

  @Get('tarea/:taskId')
  @ApiOperation({ summary: 'Obtener información de una tarea' })
  async obtenerTarea(@Param('taskId') taskId: string) {
    try {
      const task = await this.bitrixService.obtenerTarea(parseInt(taskId));
      
      return {
        success: true,
        task,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener la tarea',
        error: error.message,
      };
    }
  }

  @Get('tareas')
  @ApiOperation({ summary: 'Listar tareas con filtros' })
  @ApiQuery({ name: 'responsibleId', required: false, description: 'ID del responsable' })
  @ApiQuery({ name: 'dealId', required: false, description: 'ID de la negociación' })
  @ApiQuery({ name: 'status', required: false, description: 'Estado: 2=En progreso, 3=Esperando, 4=Completada' })
  async listarTareas(
    @Query('responsibleId') responsibleId?: string,
    @Query('dealId') dealId?: string,
    @Query('status') status?: string,
  ) {
    try {
      const tasks = await this.bitrixService.listarTareas({
        responsibleId: responsibleId ? parseInt(responsibleId) : undefined,
        dealId: dealId ? parseInt(dealId) : undefined,
        status: status ? parseInt(status) : undefined,
      });
      
      return {
        success: true,
        total: tasks?.length || 0,
        tasks,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al listar tareas',
        error: error.message,
      };
    }
  }
}
