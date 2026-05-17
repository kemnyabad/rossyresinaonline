# ✅ CHECKLIST PRE-PRODUCCIÓN - Sistema de Rifas

## 🚀 Antes de Deployar

### 1. Base de Datos ✅
- [ ] Conectar a BD de producción en `.env`
- [ ] Ejecutar: `npx prisma db push --skip-generate`
- [ ] Verificar que la tabla `RifaTicket` existe
- [ ] Confirmar que tienes al menos una rifa activa

### 2. Seguridad ✅
- [ ] Cambiar `NEXTAUTH_SECRET` a uno fuerte (min 32 caracteres)
- [ ] Configurar `NEXTAUTH_URL` con tu dominio real (https://tu-dominio.com)
- [ ] Verificar que solo admins pueden acceder a `/admin/rifas`
- [ ] Revisar variables de entorno (.env)

### 3. Funcionalidad - Usuario ✅
- [ ] Entrar a `/rifas` → Ver rifas disponibles
- [ ] Seleccionar números → Ver total actualizado en tiempo real
- [ ] Click "Ir al Carrito" → Navega a checkout
- [ ] En checkout: llenar nombre, WhatsApp, subir foto
- [ ] Click confirmar → Ver mensaje de éxito
- [ ] Verificar que números aparecen como PENDING en BD

### 4. Funcionalidad - Admin ✅
- [ ] Entrar a `/admin/rifas` (requiere login)
- [ ] Ver dashboard con conteo de números
- [ ] Verificar que se actualiza cada 10 segundos
- [ ] Ver números PENDING que los usuarios separaron
- [ ] Si hay faltantes, click "Reparar Ahora" funciona

### 5. Performance ✅
- [ ] Build: `npm run build` (sin errores)
- [ ] Verificar tamaño de bundle (debe ser < 1MB por página)
- [ ] Probar con Network throttling en DevTools
- [ ] Cargar `/rifas` en móvil → Debe ser rápido

### 6. Responsividad ✅
- [ ] Desktop (1920px): Grid 10 columnas
- [ ] Tablet (768px): Grid 8 columnas  
- [ ] Mobile (375px): Grid 5-6 columnas
- [ ] Formulario apilado correctamente en móvil
- [ ] Botones táctiles (>44px height)

### 7. Imágenes ✅
- [ ] Subir foto pequeña (< 2MB) → Funciona
- [ ] Subir foto grande (> 5MB) → Rechaza con error
- [ ] Verificar que se redimensiona automáticamente
- [ ] La imagen se previsualiza correctamente

### 8. Errores y Validación ✅
- [ ] No seleccionar números → Botón deshabilitado
- [ ] No llenar nombre → Error al confirmar
- [ ] No llenar WhatsApp → Error al confirmar
- [ ] No subir foto → Error al confirmar
- [ ] Números ya vendidos → Rechaza con error claro
- [ ] Conexión perdida → Maneja error gracefully

### 9. Base de Datos - Integridad ✅
- [ ] No hay números duplicados
- [ ] Todos los números del 1 al totalNumbers existen
- [ ] Estados son solo: AVAILABLE, PENDING, SOLD, PAID
- [ ] Cada comprador tiene: nombre, teléfono, paymentImage

### 10. Monitoreo Post-Deploy ✅
- [ ] Verificar logs del servidor por errores
- [ ] Monitorear tráfico en `/api/rifas/[id]/buy`
- [ ] Ver cuántos números se están separando
- [ ] Confirmar que base de datos está recibiendo datos

---

## 📱 Test en Móvil Real

1. Abrir `https://tu-dominio.com/rifas` en celular
2. Seleccionar números
3. Tomar foto del comprobante (desde cámara)
4. Subir foto
5. Confirmar
6. Verificar en admin que aparece en PENDING

---

## 🔍 Verificar Antes de Go Live

```bash
# 1. Build final
npm run build

# 2. Verificar variables de entorno
echo $DATABASE_URL
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET

# 3. Revisar logs
tail -f /var/log/app.log

# 4. Testear endpoint
curl -X POST https://tu-dominio.com/api/rifas/[ID]/buy \
  -H "Content-Type: application/json" \
  -d '{"numbers":[1,2,3],"buyerName":"Test","buyerPhone":"123456789","paymentImage":"test"}'
```

---

## 📞 En Caso de Problemas

1. **Los números no aparecen en la cartilla:**
   - Verifica que la rifa tenga status 'ACTIVE'
   - Ejecuta: `npx prisma studio` y revisa la tabla RifaTicket

2. **Error "Números no disponibles":**
   - Alguien más ya los compró
   - Recarga la página para ver números actualizados

3. **Foto no se carga:**
   - Verifica que sea < 5MB
   - Intenta con foto diferente
   - Revisa console del navegador (F12)

4. **Admin no carga números:**
   - Verifica autenticación (estás logged as ADMIN)
   - Revisa que la BD tiene datos
   - Intenta F5 para refrescar

---

## 🎉 LISTO PARA DEPLOY

Una vez que todos los checkboxes estén marcados, tu sistema está **100% listo** para producción.

**Recuerda:** Siempre verifica los pagos antes de cambiar de PENDING a PAID.

---

**Última actualización:** 15/04/2026
**Sistema:** Rifas v1.0.0
