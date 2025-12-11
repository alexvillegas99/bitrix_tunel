# 📊 Sistema de Auditoría y Base de Datos

Este documento explica cómo funciona el sistema de auditoría con SQLite que registra todas las acciones del sistema.

---

## 🎯 **¿Qué Registra?**

El sistema registra automáticamente:

✅ **Webhooks recibidos de Hotmart**
- Compras completadas/aprobadas
- Cancelaciones y reembolsos
- Suscripciones y cambios de plan
- Todos los eventos configurados

✅ **Acciones en Bitrix24**
- Contactos creados
- Negociaciones (deals) creadas
- Actividades registradas
- IDs de Bitrix generados

✅ **Mensajes de Jelou (WhatsApp)**
- Mensajes recibidos
- Respuestas enviadas
- Conversaciones cerradas

✅ **Datos del Cliente**
- Nombre
- Teléfono
- Email
- Productos comprados
- Montos y monedas

✅ **Métricas**
- Tiempo de procesamiento
- Estado (éxito/error)
- Errores y causas
- IPs de origen

---

## 📁 **Ubicación de la Base de Datos**

```
data/bitrix_tunnel.db
```

La base de datos se crea automáticamente la primera vez que inicias la aplicación.

---

## 🔍 **Endpoints de Consulta (API)**

### 1. Ver Todos los Eventos

```bash
GET https://tunel.ulpik.com/api/audit/events?limit=100&offset=0
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "timestamp": "2025-12-11T10:30:00.000Z",
    "event_type": "purchase_completed",
    "source": "hotmart",
    "source_event": "PURCHASE_COMPLETE",
    "bitrix_contact_id": "12345",
    "bitrix_deal_id": "67890",
    "customer_name": "Juan Pérez",
    "customer_phone": "+593999999999",
    "customer_email": "juan@ejemplo.com",
    "product_name": "ULPIK PRIV",
    "amount": 299.90,
    "currency": "USD",
    "transaction_id": "HP-12345",
    "status": "success",
    "processing_time_ms": 1234
  }
]
```

### 2. Eventos por Fuente

```bash
# Hotmart
GET https://tunel.ulpik.com/api/audit/events/source/hotmart?limit=50

# Jelou
GET https://tunel.ulpik.com/api/audit/events/source/jelou?limit=50

# Bitrix
GET https://tunel.ulpik.com/api/audit/events/source/bitrix?limit=50
```

### 3. Eventos por Tipo

```bash
GET https://tunel.ulpik.com/api/audit/events/type/purchase_completed?limit=100
GET https://tunel.ulpik.com/api/audit/events/type/contact_created?limit=100
GET https://tunel.ulpik.com/api/audit/events/type/deal_created?limit=100
```

### 4. Historial de un Contacto

```bash
GET https://tunel.ulpik.com/api/audit/events/contact/{contactId}

# Ejemplo:
GET https://tunel.ulpik.com/api/audit/events/contact/12345
```

Devuelve todas las interacciones con ese contacto.

### 5. Historial de una Negociación

```bash
GET https://tunel.ulpik.com/api/audit/events/deal/{dealId}

# Ejemplo:
GET https://tunel.ulpik.com/api/audit/events/deal/67890
```

### 6. Buscar por Teléfono

```bash
GET https://tunel.ulpik.com/api/audit/events/phone/{phone}

# Ejemplo:
GET https://tunel.ulpik.com/api/audit/events/phone/+593999999999
```

Encuentra todo el historial de un cliente por su teléfono.

### 7. Eventos con Errores

```bash
GET https://tunel.ulpik.com/api/audit/events/failed?limit=100
```

Lista todos los eventos que fallaron.

### 8. Estadísticas Generales

```bash
GET https://tunel.ulpik.com/api/audit/stats
```

**Respuesta:**
```json
{
  "total": 1500,
  "status": {
    "success": 1450,
    "error": 30,
    "pending": 20
  },
  "by_source": [
    { "source": "hotmart", "count": 800 },
    { "source": "jelou", "count": 600 },
    { "source": "bitrix", "count": 100 }
  ],
  "by_type": [
    { "event_type": "purchase_completed", "count": 750 },
    { "event_type": "contact_created", "count": 400 },
    { "event_type": "deal_created", "count": 350 }
  ],
  "today": 45,
  "avg_processing_time_ms": 1234
}
```

---

## 🔧 **Consultas Avanzadas (Desde el Servidor)**

Si tienes acceso al servidor, puedes consultar directamente la base de datos:

### Instalar SQLite Client

```bash
ssh root@159.223.204.96
apt install sqlite3
```

### Consultar la Base de Datos

```bash
cd /var/www/bitrix_tunel
sqlite3 data/bitrix_tunnel.db
```

### Ejemplos de Consultas SQL

```sql
-- Ver estructura de la tabla
.schema event_logs

-- Ver últimos 10 eventos
SELECT * FROM event_logs ORDER BY timestamp DESC LIMIT 10;

-- Eventos de hoy
SELECT * FROM event_logs 
WHERE DATE(timestamp) = DATE('now', 'localtime')
ORDER BY timestamp DESC;

-- Total de compras por producto
SELECT product_name, COUNT(*) as total, SUM(amount) as revenue
FROM event_logs
WHERE event_type = 'purchase_completed'
GROUP BY product_name
ORDER BY revenue DESC;

-- Clientes con más compras
SELECT customer_name, customer_phone, COUNT(*) as purchases, SUM(amount) as total_spent
FROM event_logs
WHERE event_type = 'purchase_completed'
GROUP BY customer_phone
ORDER BY purchases DESC
LIMIT 20;

-- Eventos con errores en las últimas 24 horas
SELECT * FROM event_logs
WHERE status = 'error'
AND timestamp > datetime('now', '-1 day')
ORDER BY timestamp DESC;

-- Promedio de tiempo de procesamiento por fuente
SELECT source, AVG(processing_time_ms) as avg_ms, COUNT(*) as total
FROM event_logs
WHERE processing_time_ms IS NOT NULL
GROUP BY source;

-- Salir de SQLite
.exit
```

---

## 📊 **Tipos de Eventos Registrados**

| Tipo de Evento | Descripción | Fuente |
|----------------|-------------|--------|
| `purchase_completed` | Compra completada en Hotmart | hotmart |
| `purchase_canceled` | Compra cancelada | hotmart |
| `subscription_created` | Nueva suscripción | hotmart |
| `subscription_canceled` | Suscripción cancelada | hotmart |
| `contact_created` | Nuevo contacto en Bitrix | bitrix |
| `deal_created` | Nueva negociación en Bitrix | bitrix |
| `activity_created` | Nueva actividad registrada | bitrix |
| `message_received` | Mensaje recibido de WhatsApp | jelou |
| `message_sent` | Mensaje enviado a WhatsApp | jelou |
| `conversation_closed` | Conversación cerrada | jelou |
| `webhook_received` | Webhook recibido | hotmart/jelou |

---

## 🛠️ **Mantenimiento**

### Limpiar Eventos Antiguos

Los eventos se acumulan en el tiempo. Puedes limpiar eventos antiguos:

```typescript
// Desde el código (si implementas un cron job)
await auditService.cleanOldEvents(90); // Mantener solo últimos 90 días
```

O manualmente desde SQL:

```sql
-- Eliminar eventos más antiguos de 90 días
DELETE FROM event_logs 
WHERE timestamp < datetime('now', '-90 days');

-- Vacuumear la base de datos para liberar espacio
VACUUM;
```

### Hacer Backup

```bash
# Backup de la base de datos
ssh root@159.223.204.96
cd /var/www/bitrix_tunel
cp data/bitrix_tunnel.db data/bitrix_tunnel_backup_$(date +%Y%m%d).db

# Comprimir
tar -czf bitrix_tunnel_backup_$(date +%Y%m%d).tar.gz data/bitrix_tunnel.db
```

---

## 📈 **Casos de Uso**

### 1. Ver el Historial Completo de un Cliente

```bash
curl https://tunel.ulpik.com/api/audit/events/phone/+593999999999 | jq '.'
```

Te mostrará:
- Todas las compras
- Mensajes enviados/recibidos
- Negociaciones creadas
- Actividades registradas

### 2. Analizar Compras del Día

```bash
curl https://tunel.ulpik.com/api/audit/stats | jq '.today'
```

### 3. Detectar Problemas

```bash
curl https://tunel.ulpik.com/api/audit/events/failed | jq '.'
```

Te muestra todos los eventos que fallaron con los mensajes de error.

### 4. Monitorear Rendimiento

```bash
curl https://tunel.ulpik.com/api/audit/stats | jq '.avg_processing_time_ms'
```

---

## 🔒 **Seguridad**

### Proteger los Endpoints de Auditoría

Los endpoints de auditoría están públicos por defecto. Para protegerlos:

1. **Agregar autenticación** (recomendado):
   - Implementar guards de NestJS
   - Requerir API key o JWT

2. **Restringir por IP**:
   - Configurar Nginx para permitir solo IPs específicas

3. **Ejemplo de Nginx**:

```nginx
location /api/audit {
    allow 192.168.1.0/24;  # Tu red interna
    allow 10.0.0.1;         # IP específica
    deny all;

    proxy_pass http://localhost:3333;
}
```

---

## 📊 **Estructura de la Tabla**

```sql
CREATE TABLE "event_logs" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "timestamp" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "event_type" VARCHAR NOT NULL,
  "source" VARCHAR NOT NULL,
  "source_event" VARCHAR,
  "bitrix_contact_id" VARCHAR,
  "bitrix_deal_id" VARCHAR,
  "bitrix_activity_id" VARCHAR,
  "customer_name" VARCHAR,
  "customer_phone" VARCHAR,
  "customer_email" VARCHAR,
  "product_name" VARCHAR,
  "amount" DECIMAL(10,2),
  "currency" VARCHAR,
  "transaction_id" VARCHAR,
  "status" VARCHAR NOT NULL,
  "error_message" TEXT,
  "payload" TEXT,
  "ip_address" VARCHAR,
  "processing_time_ms" INTEGER
);
```

---

## 🔗 **Integración con Bitrix**

Desde Bitrix24, puedes crear un campo personalizado que muestre el historial:

```javascript
// Widget de Bitrix24
BX24.init(function() {
  var contactId = BX24.placement.info().entityId;
  
  fetch(`https://tunel.ulpik.com/api/audit/events/contact/${contactId}`)
    .then(res => res.json())
    .then(data => {
      // Mostrar historial en Bitrix
      console.log('Historial del contacto:', data);
    });
});
```

---

## 📞 **Soporte**

Si necesitas ayuda:
1. Revisa los logs: `pm2 logs bitrix-tunnel`
2. Consulta la base de datos directamente
3. Revisa la documentación de Swagger: `https://tunel.ulpik.com/docs`

---

**Creado**: Diciembre 2025  
**Versión**: 1.0.0

