# Backend: ventas para el informe «Incentivo y Metas» (Cuadro de Control)

La web ya tiene el informe **Metas → Cuadro de Control → Incentivo y Metas**: metas del vendedor en el
mes (meta, mínimo, incentivo por unidad) contra lo **vendido en el ERP por semana**. Solo falta un
endpoint de lectura con las ventas. Mientras no exista, la web usa `Venta_Unidades` de cada meta.

## Endpoint

`GET /api/v1/fr/metaVentaProducto/avance?anio=2026&mes=11&vendedor=VBM`

- Token web, rol Admin o Fr (igual que el resto de `/metaVentaProducto`).
- `anio` y `mes` obligatorios; `vendedor` opcional (sin él, todos los vendedores).
- Solo lectura. Responde `{ result, success, errors }`.

Respuesta: ventas agrupadas por vendedor, artículo y **día** (la web arma las semanas):

```json
{ "success": true, "result": [
  { "VENDEDOR": "VBM", "ARTICULO": "16006", "FECHA": "2026-11-06", "CANTIDAD": 12, "VALOR": 30.12 },
  { "VENDEDOR": "VBM", "ARTICULO": "16108", "FECHA": "2026-11-05", "CANTIDAD": 4,  "VALOR": 18.40 }
] }
```

## Origen de los datos (probado en COAGRO2, solo lectura)

- `CINCOH.FACTURA` (encabezado: `VENDEDOR`, `FECHA`, `ANULADA`, `TIPO_DOCUMENTO`)
- `CINCOH.FACTURA_LINEA` (`ARTICULO`, `CANTIDAD`, `PRECIO_TOTAL`)
- Sin anuladas (`ANULADA = 'N'`). Las devoluciones (`TIPO_DOCUMENTO = 'D'`) **restan**.
- Prueba VBM noviembre 2026: 95 filas en ~1.3 s; 16006 = 12 (6-nov) y 16108 = 4 (5-nov), igual que el
  informe de ejemplo.

## Código listo para pegar

`controllers/fr/metaVentaProducto.js` (agregar y exportar):

```js
// GET /fr/metaVentaProducto/avance?anio=&mes=&vendedor=
// Ventas del ERP del mes por vendedor, articulo y dia (para el informe Incentivo y Metas).
// Devoluciones (TIPO_DOCUMENTO 'D') restan; sin anuladas.
const getAvanceVentas = async (req, res) => {
  try {
    const anio = parseInt(req.query.anio, 10);
    const mes = parseInt(req.query.mes, 10);
    if (!anio || !mes || mes < 1 || mes > 12) {
      return res.send({ result: [], success: false, errors: ["anio y mes (1 a 12) son obligatorios"] });
    }
    const vendedor = String(req.query.vendedor || "").trim();
    const p = (n) => String(n).padStart(2, "0");
    const desde = `${anio}-${p(mes)}-01`;
    const hasta = mes === 12 ? `${anio + 1}-01-01` : `${anio}-${p(mes + 1)}-01`;

    const data = await sequelize.query(
      `SELECT RTRIM(F.VENDEDOR) AS VENDEDOR, RTRIM(L.ARTICULO) AS ARTICULO,
              CONVERT(char(10), F.FECHA, 23) AS FECHA,
              SUM(CASE WHEN F.TIPO_DOCUMENTO = 'D' THEN -L.CANTIDAD ELSE L.CANTIDAD END) AS CANTIDAD,
              SUM(CASE WHEN F.TIPO_DOCUMENTO = 'D' THEN -L.PRECIO_TOTAL ELSE L.PRECIO_TOTAL END) AS VALOR
         FROM CINCOH.FACTURA F
         JOIN CINCOH.FACTURA_LINEA L ON L.FACTURA = F.FACTURA AND L.TIPO_DOCUMENTO = F.TIPO_DOCUMENTO
        WHERE F.ANULADA = 'N' AND F.FECHA >= :desde AND F.FECHA < :hasta
          AND (:vendedor = '' OR F.VENDEDOR = :vendedor)
        GROUP BY F.VENDEDOR, L.ARTICULO, CONVERT(char(10), F.FECHA, 23)
        ORDER BY 1, 2, 3`,
      { replacements: { desde, hasta, vendedor }, type: QueryTypes.SELECT }
    );
    res.send({ result: data, success: true });
  } catch (error) {
    console.log(error);
    res.send({ result: [], success: false, errors: ["Error al consultar las ventas del mes"] });
  }
};
```

(`QueryTypes` de `sequelize` y `sequelize` de `config/mssql` si el archivo aún no los importa.)

`routes/fr/metaVentaProducto.js` — **antes** de `router.get("/:id", ...)`:

```js
router.get("/avance", authMiddleware, roles, getAvanceVentas);
```

## Al tenerlo

En la web: `src/app/modules/metas/metas-shared/metas-api.service.ts` →
`VENTAS_BACKEND_DISPONIBLE = true`. El informe pasa a mostrar las ventas por semana del ERP.

## Reglas del informe (para validar con COAGRO)

- Semanas de lunes a sábado dentro del mes (nov 2026: 2–7, 9–14, 16–21, 23–28, 30); el domingo
  cuenta con la semana anterior y los días antes del primer lunes con la semana 1.
- Avance = vendido / meta. Faltan = meta − vendido (mínimo 0).
- **Paga** cuando vendido ≥ mínimo × «% mínimo para cobrar» (100 % por defecto, editable).
- Incentivo ganado = vendido × $ por unidad (solo si paga). Incentivo a meta = meta × $ por unidad.
- «Meta cumplida» cuando vendido ≥ meta.
