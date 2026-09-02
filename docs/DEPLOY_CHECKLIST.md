# Checklist Fijo de Publicacion

## Antes del deploy
- Ejecutar backup semanal/manual: `npm run backup:weekly`
- Confirmar `MAINTENANCE_MODE=true` si el cambio impacta checkout, admin o base de datos.
- Verificar variables criticas en entorno:
  - `DATABASE_URL`
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - `CLOUDINARY_*`
  - `ADMIN_EMAILS`
- Confirmar PR abierto y CI en verde (`lint + build`).

## Durante el deploy
- Hacer merge solo con CI aprobado.
- Monitorear logs de API:
  - `GET /api/products`
  - `POST /api/orders`
  - `GET /api/admin/dashboard`
- Verificar que no aparezcan errores `5xx` recurrentes en los primeros 5-10 minutos.

## Despues del deploy
- Smoke test rapido:
  - Home
  - Productos
  - Carrito
  - Checkout
  - Admin (`/admin`)
- Revisar un pedido reciente en panel.
- Si todo esta estable, desactivar mantenimiento (`MAINTENANCE_MODE=false`).
- Registrar resultado del deploy en el tablero del sprint.
