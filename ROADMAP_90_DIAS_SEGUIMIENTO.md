# Seguimiento Roadmap 90 Dias

Fecha de inicio: 12 de abril de 2026

## Fase 1 (Dias 1-30) - Base solida

### Estado general
- [ ] Estabilizar produccion actual
- [ ] Blindaje tecnico
- [ ] Estructura modular

### Dia 1 completado
- [x] Checklist fijo de publicacion en `docs/DEPLOY_CHECKLIST.md`
- [x] Script de backup semanal en `scripts/backup-weekly.ps1`
- [x] Comando `npm run backup:weekly`
- [x] Validaciones Zod en endpoints criticos:
  - `src/pages/api/products.ts` (ya existente y mantenido)
  - `src/pages/api/orders/index.ts` (agregado)
  - `src/pages/api/admin/users.ts` (agregado)
- [x] Logger central creado en `src/lib/logger.ts` y aplicado en endpoints criticos
- [x] Estructura modular base creada:
  - `src/modules/ecommerce`
  - `src/modules/videos`
  - `src/modules/comunidad`

### Proximo bloque sugerido (Dias 2-7)
- [ ] Activar branch protection en GitHub (`main` requiere PR + CI verde)
- [ ] Agregar pruebas de humo API para `products`, `orders`, `users`
- [ ] Definir rotacion de backups (retencion 8 semanas)
- [ ] Migrar primeras piezas de ecommerce a `src/modules/ecommerce`
