# 🚀 Guía de Despliegue - Bitrix Tunnel

## ✅ Estado del Despliegue

**Servidor**: `root@159.223.204.96`  
**Dominio**: `tunel.ulpik.com` (⚠️ **Requiere configuración DNS**)  
**Fecha**: Diciembre 11, 2024  

---

## 📊 Servicios Instalados y Funcionando

### ✅ Software Instalado

| Servicio | Versión | Estado |
|----------|---------|--------|
| **Ubuntu** | 24.04 LTS | ✅ Corriendo |
| **Node.js** | v22.21.0 | ✅ Instalado |
| **NPM** | 10.9.4 | ✅ Instalado |
| **Nginx** | 1.24.0 | ✅ Corriendo |
| **PM2** | Latest | ✅ Corriendo |
| **Certbot** | 2.9.0 | ✅ Instalado |

### ✅ Aplicación

| Componente | Estado |
|------------|--------|
| **Repositorio** | ✅ Clonado en `/var/www/bitrix_tunel` |
| **Dependencias** | ✅ Instaladas (853 paquetes) |
| **Compilación** | ✅ Build exitoso |
| **PM2 Process** | ✅ Online (bitrix-tunnel) |
| **Auto-start** | ✅ Configurado (systemd) |
| **Puerto** | ✅ 3333 |
| **Logs** | ✅ `/var/www/bitrix_tunel/logs/` |

### ✅ Nginx

| Configuración | Estado |
|---------------|--------|
| **Sitio configurado** | ✅ `/etc/nginx/sites-available/tunel.ulpik.com` |
| **Sitio habilitado** | ✅ `/etc/nginx/sites-enabled/tunel.ulpik.com` |
| **Reverse Proxy** | ✅ → http://localhost:3333 |
| **Max Body Size** | ✅ 150MB |
| **HTTP** | ✅ Puerto 80 |
| **HTTPS** | ⚠️ Pendiente (requiere DNS) |

---

## ⚠️ ACCIÓN REQUERIDA: Configurar DNS

### Paso 1: Agregar Registro DNS

Debes configurar el DNS de `tunel.ulpik.com` para que apunte al servidor:

**Registro A:**
```
Tipo: A
Host: tunel (o @tunel si usas subdominio)
Valor: 159.223.204.96
TTL: 300 (5 minutos) o 3600 (1 hora)
```

### Dónde configurar:

1. **Si usas Cloudflare:**
   - DNS → Add Record
   - Type: A
   - Name: tunel
   - IPv4 address: 159.223.204.96
   - Proxy status: DNS only (nube gris) 🌐 ⚠️ **Importante: Sin proxy primero**
   - TTL: Auto

2. **Si usas otro proveedor** (GoDaddy, Namecheap, etc.):
   - Ve a la sección de DNS
   - Agrega un registro tipo A
   - Apunta `tunel.ulpik.com` → `159.223.204.96`

### Paso 2: Verificar DNS

Espera 5-15 minutos y verifica:

```bash
# Desde tu computadora local
nslookup tunel.ulpik.com

# O con dig
dig tunel.ulpik.com +short

# Debería mostrar: 159.223.204.96
```

### Paso 3: Instalar Certificado SSL

Una vez que el DNS esté configurado, ejecuta:

```bash
ssh root@159.223.204.96 "certbot --nginx -d tunel.ulpik.com --non-interactive --agree-tos --email cto@ulpik.com --redirect"
```

Esto:
- ✅ Instalará certificado SSL de Let's Encrypt
- ✅ Configurará HTTPS automáticamente
- ✅ Redirigirá HTTP → HTTPS
- ✅ Renovación automática

---

## 🧪 Pruebas Actuales (HTTP)

### Desde Internet (una vez configurado el DNS):

```bash
# Endpoint de prueba Hotmart
curl -X POST http://tunel.ulpik.com/api/hotmart/test

# Respuesta esperada:
{
  "status": "ok",
  "message": "Endpoint de Hotmart funcionando correctamente",
  "timestamp": "2025-12-11T09:41:16.088Z"
}
```

### Desde el servidor (funciona ahora):

```bash
ssh root@159.223.204.96

# Test Hotmart
curl -X POST http://localhost:3333/api/hotmart/test

# Ver logs en tiempo real
pm2 logs bitrix-tunnel

# Ver estado
pm2 status
```

---

## 📁 Estructura en el Servidor

```
/var/www/bitrix_tunel/
├── src/                    # Código fuente TypeScript
│   ├── hotmart/           # Módulo Hotmart
│   ├── jelou/             # Módulo Jelou
│   └── bitrix/            # Módulo Bitrix
├── dist/                   # Código compilado JavaScript
├── node_modules/           # Dependencias
├── logs/                   # Logs de la aplicación
│   ├── hotmart.log        # Logs de webhooks Hotmart
│   └── emails.log         # Logs de emails
├── package.json
└── ...

/etc/nginx/
├── sites-available/
│   └── tunel.ulpik.com    # Configuración del sitio
└── sites-enabled/
    └── tunel.ulpik.com    # Symlink al disponible

/root/.pm2/
├── logs/
│   ├── bitrix-tunnel-out.log   # Logs stdout
│   └── bitrix-tunnel-error.log # Logs stderr
└── dump.pm2               # Estado de PM2 para auto-start
```

---

## 🔧 Comandos Útiles

### PM2 (Gestión de la Aplicación)

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs bitrix-tunnel

# Ver logs (últimas 100 líneas)
pm2 logs bitrix-tunnel --lines 100 --nostream

# Reiniciar aplicación
pm2 restart bitrix-tunnel

# Detener aplicación
pm2 stop bitrix-tunnel

# Iniciar aplicación
pm2 start bitrix-tunnel

# Ver información detallada
pm2 info bitrix-tunnel

# Monitorear recursos
pm2 monit
```

### Nginx

```bash
# Probar configuración
nginx -t

# Recargar configuración
systemctl reload nginx

# Reiniciar Nginx
systemctl restart nginx

# Ver estado
systemctl status nginx

# Ver logs de acceso
tail -f /var/log/nginx/tunel.ulpik.com.access.log

# Ver logs de errores
tail -f /var/log/nginx/tunel.ulpik.com.error.log
```

### Actualizar la Aplicación

```bash
cd /var/www/bitrix_tunel

# Obtener últimos cambios
git pull origin master

# Instalar nuevas dependencias (si hay)
npm install

# Recompilar
npm run build

# Reiniciar
pm2 restart bitrix-tunnel

# Ver logs para verificar
pm2 logs bitrix-tunnel --lines 50
```

### Ver Logs de la Aplicación

```bash
# Logs de Hotmart
tail -f /var/www/bitrix_tunel/logs/hotmart.log

# Logs de emails
tail -f /var/www/bitrix_tunel/logs/emails.log

# Logs de PM2 (stdout)
tail -f /root/.pm2/logs/bitrix-tunnel-out.log

# Logs de PM2 (stderr)
tail -f /root/.pm2/logs/bitrix-tunnel-error.log
```

---

## 🌐 URLs del Proyecto (Después de DNS + SSL)

| Recurso | URL |
|---------|-----|
| **API Base** | `https://tunel.ulpik.com/api/` |
| **Hotmart Webhook** | `https://tunel.ulpik.com/api/hotmart/webhook` |
| **Hotmart Test** | `https://tunel.ulpik.com/api/hotmart/test` |
| **Jelou Webhook** | `https://tunel.ulpik.com/api/jelou/webhook` |
| **Jelou Responder** | `https://tunel.ulpik.com/api/jelou/responder?id={dealId}` |
| **Swagger API Docs** | `https://tunel.ulpik.com/docs` |

---

## 📋 Checklist Post-DNS

Una vez que el DNS esté configurado:

### 1. Verificar DNS
```bash
nslookup tunel.ulpik.com
# Debe mostrar: 159.223.204.96
```

### 2. Instalar SSL
```bash
ssh root@159.223.204.96 "certbot --nginx -d tunel.ulpik.com --non-interactive --agree-tos --email cto@ulpik.com --redirect"
```

### 3. Probar HTTPS
```bash
curl -X POST https://tunel.ulpik.com/api/hotmart/test
```

### 4. Configurar Webhooks

#### Hotmart:
- URL: `https://tunel.ulpik.com/api/hotmart/webhook`
- Token: `ktCAmqR5vpcqxdtWKSqhLA9EQON1NRc4662751-fa3b-493b-8204-13f8721091dc`
- Versión: 2.0.0
- Eventos: Seleccionar todos los necesarios

#### Jelou:
- URL: `https://tunel.ulpik.com/api/jelou/webhook`

### 5. Verificar Logs
```bash
ssh root@159.223.204.96
pm2 logs bitrix-tunnel
tail -f /var/www/bitrix_tunel/logs/hotmart.log
```

---

## 🔒 Seguridad

### Firewall (UFW) - Recomendado

```bash
# Habilitar firewall
ufw enable

# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP
ufw allow 80/tcp

# Permitir HTTPS
ufw allow 443/tcp

# Ver estado
ufw status
```

### Fail2Ban - Recomendado para Protección SSH

```bash
# Instalar
apt install fail2ban -y

# Configurar
systemctl enable fail2ban
systemctl start fail2ban

# Ver estado
fail2ban-client status sshd
```

---

## 🆘 Troubleshooting

### La aplicación no inicia

```bash
# Ver logs de PM2
pm2 logs bitrix-tunnel --err

# Ver si el puerto está ocupado
lsof -i :3333

# Reiniciar PM2
pm2 restart bitrix-tunnel
```

### Nginx da error 502

```bash
# Verificar que la app esté corriendo
pm2 status

# Probar endpoint local
curl http://localhost:3333/api/hotmart/test

# Ver logs de Nginx
tail -f /var/log/nginx/tunel.ulpik.com.error.log
```

### SSL no se instala

```bash
# Verificar DNS primero
nslookup tunel.ulpik.com

# Ver logs de certbot
cat /var/log/letsencrypt/letsencrypt.log

# Probar manualmente
certbot --nginx -d tunel.ulpik.com
```

### Los webhooks no llegan

```bash
# Verificar que la app responda desde internet
curl -X POST https://tunel.ulpik.com/api/hotmart/test

# Ver logs en tiempo real
pm2 logs bitrix-tunnel
tail -f /var/www/bitrix_tunel/logs/hotmart.log

# Verificar firewall
ufw status
```

---

## 📞 Soporte

**Servidor**: `root@159.223.204.96`  
**Repositorio**: https://github.com/cto-ulpik/bitrix_tunel  
**Documentación**: Ver archivos `*.md` en el repositorio  

---

## ✅ Checklist Final

- [x] Ubuntu 24.04 instalado y actualizado
- [x] Node.js 22 instalado
- [x] Nginx instalado y configurado
- [x] PM2 instalado y configurado
- [x] Repositorio clonado
- [x] Dependencias instaladas
- [x] Aplicación compilada
- [x] Aplicación corriendo con PM2
- [x] Auto-start configurado
- [x] Nginx configurado como reverse proxy
- [x] Logs funcionando
- [ ] **DNS configurado** ⚠️ **PENDIENTE**
- [ ] **SSL instalado** ⚠️ **PENDIENTE (después de DNS)**
- [ ] **Webhooks configurados en Hotmart** ⚠️ **PENDIENTE (después de SSL)**
- [ ] **Webhooks configurados en Jelou** ⚠️ **PENDIENTE (después de SSL)**

---

**Última actualización**: Diciembre 11, 2025  
**Estado**: Aplicación funcionando, esperando configuración DNS

