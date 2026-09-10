# 📝 Guía Rápida - Admin: Verificar y Confirmar Pagos

## Cuando un Usuario Separa Números

### ¿Qué pasa?
1. Usuario elige números en la cartilla
2. Sube foto del comprobante
3. Números aparecen en tu panel como **🟡 PENDIENTES**
4. Tú debes verificar el pago

---

## Cómo Verificar y Confirmar en el Panel Admin

### Paso 1: Abre el Panel
- Ve a: `https://tu-dominio.com/admin/rifas`
- Debes estar logueado como ADMIN

### Paso 2: Localiza la Rifa
- Busca el sorteo (ej: "FELIZ DÍA DE LA MADRE")
- Verás el conteo de números

### Paso 3: Ve los Números Pendientes
- Haz clic en el número que tiene estado **PENDIENTE** (amarillo)
- Se abre modal con detalles:
  - **Nombre del Comprador**
  - **Teléfono (WhatsApp)**
  - **Foto del Comprobante** (clickeable para ver)
  - **Números separados**

### Paso 4: Verifica el Pago
- Abre la foto del comprobante
- Verifica:
  - ✅ Monto correcto (número de tickets × precio)
  - ✅ Banco/Plataforma correcta
  - ✅ Referencia o ID de transacción
  - ✅ Nombre del comprador coincide

### Paso 5: Confirma el Pago
Opción A - Desde el Panel (automático):
```
1. Haz clic en el botón "✅ Confirmar Pago"
2. El estado cambia a 🟢 PAGADO
3. El comprador recibe confirmación automática
```

Opción B - Desde API (manual, si es necesario):
```bash
curl -X POST "https://tu-dominio.com/api/admin/utils?action=set-status" \
  -H "Content-Type: application/json" \
  -d '{
    "rifaId": "rifa-123",
    "numbers": [15, 25, 34, 35],
    "newStatus": "PAID"
  }'
```

---

## Estados de los Números

| Estado | Color | Significado | Acción |
|--------|-------|-------------|--------|
| AVAILABLE | 🔵 Gris | Libre para comprar | Esperar |
| PENDING | 🟡 Amarillo | Esperando confirmación de pago | ✅ Verifica y confirma |
| SOLD | 🟠 Naranja | Vendido pero no pagado | Cobrar |
| PAID | 🟢 Verde | Pagado y confirmado | Sorteo |

---

## ¿Qué Hacer si Hay Problemas?

### "El usuario dice que pagó pero no aparece"
1. Espera 10 segundos (auto-actualiza)
2. Haz click en 🔄 Refrescar
3. Si sigue sin aparecer:
   - Pide foto del comprobante por WhatsApp
   - Usa endpoint `/api/admin/utils?action=set-status` para confirmar manual

### "El usuario pagó menos de lo debido"
1. Contacta al usuario por WhatsApp
2. Pide que complete el pago
3. No confirmes hasta que esté correcto

### "El usuario pagó más"
1. Decide si devuelves la diferencia
2. O si es para próximas compras
3. Documenta en tu sistema interno

### "Se perdió una foto"
1. Pide foto nuevamente por WhatsApp
2. Verifica que coincida con los números

### "Faltan números en la cartilla"
1. Ve al panel admin
2. Verifica que ves el botón "Reparar Ahora"
3. Haz clic → se regeneran números automáticamente

---

## Checklist Diario

- [ ] Abre `/admin/rifas` a primera hora
- [ ] Revisa números 🟡 PENDIENTES
- [ ] Verifica fotos de comprobantes
- [ ] Confirma pagos válidos
- [ ] Anotan en tu sistema: Cliente + Monto + Fecha
- [ ] Si hay números faltantes → Haz clic "Reparar"
- [ ] Prepara los números ganadores para el sorteo

---

## 📞 Rápido: Desde Móvil

1. Abre WhatsApp
2. El cliente envía foto de comprobante
3. Abre navegador → `/admin/rifas`
4. Busca los números pendientes
5. Verifica que sea el mismo cliente y monto
6. Haz clic ✅ Confirmar
7. Responde al cliente: "✅ Pago confirmado, números separados"

---

## 🔐 Nota de Seguridad

- ✅ Siempre verifica la foto del comprobante
- ✅ Nunca confirmes sin ver la prueba
- ✅ Guarda copia de las fotos (backup)
- ✅ Usa contraseña fuerte para `/admin`

---

**¡Listo! Ya sabes cómo manejar los pagos.** 🎉
