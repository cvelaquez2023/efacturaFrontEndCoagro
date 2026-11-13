# Backend: datos que faltan para el Dashboard (Metas → Cuadro de Control → Dashboard)

El Dashboard ya funciona con lo que existe (ventasDiarias, metas, visitas y pedidos). Para mostrar
**ganancia/margen** y agrupar **todas** las ventas por proveedor y línea (no solo los artículos con
meta), basta con agregar 4 columnas a `GET /api/v1/fr/metaVentaProducto/ventasDiarias`. La web ya
las lee si vienen: no hay que cambiar nada más.

## Columnas nuevas en cada fila de `result.ventas`

| Campo | Origen | Uso |
|---|---|---|
| `COSTO` | `SUM(signo * FACTURA_LINEA.COSTO_TOTAL_DOLAR)` (devoluciones restan, igual que UNIDADES/VALOR) | Ganancia bruta = VALOR − COSTO, margen % |
| `LINEA` | `ARTICULO.CLASIFICACION_3` | Filtro y gráfico por línea |
| `LINEA_DESCRIPCION` | `CINCOH.CLASIFICACION.DESCRIPCION` (AGRUPACION = 3) | Nombre de la línea |
| `PROVEEDOR` | `ARTICULO.PROVEEDOR` (o el código de proveedor que usen en metas) | Filtro y gráfico por proveedor |

Probado en COAGRO2 (solo lectura): VBM noviembre 2026 → venta $9,638.82, costo $6,804.50
(margen 29.4 %). `COSTO_TOTAL_DOLAR` y `COSTO_TOTAL` dan lo mismo en estas facturas.

## Cambio sugerido en `controllers/fr/metaVentaProducto.js` → `ventasDiarias`

En la subconsulta agrupada, junto a UNIDADES y VALOR:

```sql
SUM(CASE WHEN f.TIPO_DOCUMENTO = 'D' THEN -1 ELSE 1 END * fl.COSTO_TOTAL_DOLAR) AS COSTO,
```

y en el SELECT exterior (ya hace JOIN con ARTICULO para la descripción):

```sql
CAST(V.COSTO AS float) AS COSTO,
LTRIM(RTRIM(A.CLASIFICACION_3)) AS LINEA,
(SELECT TOP 1 C.DESCRIPCION FROM CINCOH.CLASIFICACION C
  WHERE C.AGRUPACION = 3 AND C.CLASIFICACION = A.CLASIFICACION_3) AS LINEA_DESCRIPCION,
LTRIM(RTRIM(A.PROVEEDOR)) AS PROVEEDOR
```

## Opcional (más adelante)

- `GET /ventasDiarias?desde=&hasta=` (rango de fechas) para que la vista anual no haga 12 consultas.
- Cobros/cartera por vendedor si se quiere un indicador de recuperación en el Dashboard.
