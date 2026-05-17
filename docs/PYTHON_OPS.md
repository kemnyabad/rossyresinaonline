# Python para operaciones internas

Python se usa en este proyecto solo como complemento operativo. No reemplaza
Next.js, TypeScript, Prisma ni las APIs principales de la web.

## Para que sirve

- Reportes administrativos.
- Revision de stock bajo.
- Revision de pedidos pendientes.
- Revision de tickets de rifas pendientes.
- Base futura para backups, tareas programadas e integraciones internas.

## Requisitos

Python 3.10 o superior.

En Windows, si `python` abre Microsoft Store o falla con `WindowsApps`, instala
Python desde `python.org` o desactiva el alias en:

```text
Configuracion > Aplicaciones > Configuracion avanzada de aplicaciones > Alias de ejecucion de aplicaciones
```

Para leer la base de datos MySQL/TiDB instala la dependencia:

```powershell
python -m pip install -r scripts/python/requirements.txt
```

Si no instalas la dependencia, el script puede usar los JSON locales como
fallback, pero el reporte no reflejara todos los datos actuales de produccion.

## Generar reporte

Desde la raiz del proyecto:

```powershell
python scripts/python/ops_report.py
```

Reporte solo con JSON locales:

```powershell
python scripts/python/ops_report.py --json-only
```

Cambiar ventana de ventas y umbral de stock:

```powershell
python scripts/python/ops_report.py --days 90 --stock-threshold 3
```

Los archivos se generan en:

```text
reports/ops/YYYYMMDD-HHMMSS/
```

## Seguridad

- El script lee `.env`, pero no imprime `DATABASE_URL` ni secretos.
- No modifica datos de la base de datos.
- No forma parte del runtime publico de la web.
- Los reportes generados quedan fuera de Git.

## Recomendacion

Mantener Python para tareas internas. La tienda, el panel admin, las APIs y el
frontend deben seguir en Next.js/TypeScript salvo que aparezca una necesidad
operativa especifica que justifique separar un servicio.
