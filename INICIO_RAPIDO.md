# 🚀 INICIO RÁPIDO - Deploy en 5 Minutos

## Si Tienes Error de Permisos (EPERM en Windows)

### Solución Rápida:
```powershell
# 1. Elimina node_modules completamente
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path ".next" -Recurse -Force
Remove-Item -Path ".prisma" -Recurse -Force

# 2. Limpia caché de npm
npm cache clean --force

# 3. Reinstala con --no-optional
npm install --no-optional

# 4. Genera tipos de Prisma
npx prisma generate

# 5. Sincroniza la base de datos
npx prisma db push

# 6. Build final
npm run build
```

---

## Deployment Rápido

### A. Vercel (Recomendado - 2 minutos)
```bash
npm i -g vercel
vercel deploy --prod
```

### B. Servidor Propio (PM2)
```bash
npm run build
npm run start

# O con PM2 para que no se cierre:
pm2 start npm --name "rifas" -- start
pm2 startup
pm2 save
```

---

## Configuración Mínima Requerida

Archivo `.env.local`:
```env
DATABASE_URL="mysql://[user]:[pass]@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/[dbname]"
NEXTAUTH_SECRET="[generar: openssl rand -base64 32]"
NEXTAUTH_URL="https://[tu-dominio.com]"
```

---

## Test Inmediato Post-Deploy

```bash
# 1. Test GET
curl https://[tu-dominio]/api/admin/utils?action=status

# 2. Test frontend
# Abre en navegador: https://[tu-dominio]/rifas
```

---

## En Caso de Error

| Error | Solución |
|-------|----------|
| `EPERM` en Windows | Ejecuta pasos de "Solución Rápida" arriba |
| `DATABASE_URL` no válido | Verifica credenciales en .env.local |
| `/admin/rifas` redirige a login | Tienes que crear usuario ADMIN (ver ADMIN_QUICK_START.md) |
| Números no cargan | Asegúrate que tienes al menos 1 rifa en BD |

---

**⏱️ 5 minutos y listo en producción!**
