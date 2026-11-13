# Backend: Condiciones Especiales por Cliente y Promociones de Temporada (FR / Ruteo)

**Para:** programador del backend `efacturaBackendCoagro` (rama `develop`).
**Frontend que lo consume:** `efacturaFrontEndCoagro`, módulo FR → Administración. Las pantallas
ya están construidas con datos de prueba y se conectan en cuanto existan estos endpoints.

## 1. Qué se necesita y por qué

COAGRO quiere manejar desde la web (parte administrativa):

1. **Condiciones especiales por cliente**: a un cliente se le autoriza un *descuento máximo* o un
   *precio especial* para un producto, una línea completa (p. ej. "Productos Vet Calox") o los
   productos cuyo nombre contenga un texto (p. ej. "CREDELIO"). Opcionalmente "a partir de N
   unidades".
2. **Promociones de temporada**: descuentos %, precios especiales o bonificaciones ("compre 1 y
   llévese 1") que aplican a todos los clientes o a ciertas rutas / tipos de cliente / clientes.

**Regla principal: todo funciona por rango de fechas y el precio base NUNCA se modifica.**
`ARTICULO_PRECIO` queda intacto. Cada condición o promoción tiene `FECHA_INICIO` y `FECHA_FIN`;
el precio final se calcula al momento (`precio base del nivel del cliente` − `regla vigente`).
Cuando la fecha de inicio llega, la regla empieza a aplicar sola; cuando vence, se vuelve sola al
precio base. **No se necesitan jobs ni procesos nocturnos.**

## 2. Datos que ya existen (verificados en COAGRO2, solo lectura)

| Concepto | Dónde está | Nota |
|---|---|---|
| Línea del producto (CALOX, ZOETIS, BAYER…) | `erpadmin.ARTICULO.CLASIFICACION3` → catálogo `CINCOH.CLASIFICACION` con `AGRUPACION = 3` | Ej. `0010` = "Productos Vet Calox", `0005` = "Productos Bayer Vet", `0007` = "Productos Reveex" |
| Precio base | `erpadmin.ARTICULO_PRECIO` por `NIVEL_PRECIO` del cliente (`erpadmin.cliente.NIVEL_PRECIO`) | Ya lo usa `/fr/sync/articulos` |
| Tipos de cliente | `erpadmin.alFAC_TIP_CLT` (`COD_TIP_CL`, `DES_TIP_CL`) | 18 filas hoy; ya se envía a la app en `/fr/sync/clientes` |
| Tipo de cliente de cada cliente | `erpadmin.CLIENTE_CIA.COD_TIP_CL` | |
| Agente / vendedor de la ruta | `erpadmin.RUTA_ASIGNADA_RT.AGENTE` (+ `RUTA_CLIENTE` para cliente→ruta) | Para mostrar "Jennyfer Batres" en cada condición |

> Softland FR trae tablas `erpadmin.DESCUENTO_CLIART`, `DESCUENTO_CLAS` y `DESCUENTO_NIVEL`
> (todas **vacías**, con fechas y cantidades). **No se recomienda usarlas**: no tienen llave
> única (ID), ni texto en el nombre, ni precio especial, ni estado activo/inactivo, ni auditoría,
> y otro proceso de Softland podría leerlas. Por eso se proponen tablas propias `FR_*`.

## 3. Tablas nuevas (schema `erpadmin`, BD `COAGRO2`)

> **Archivos listos para usar:**
> - [`backend/01_fr_condiciones_promociones.sql`](backend/01_fr_condiciones_promociones.sql): script completo, se puede ejecutar más de una vez, con datos de ejemplo opcionales.
> - [`backend/02_modelos_sequelize.js`](backend/02_modelos_sequelize.js): los 4 modelos Sequelize y sus relaciones, para copiar en `models/fr/`.
>
> El SQL de abajo es el resumen; si hay diferencia, manda el archivo `.sql`.

```sql
-- 3.1 Condiciones especiales por cliente
CREATE TABLE erpadmin.FR_CONDICION_CLIENTE (
  ID                 INT IDENTITY(1,1) PRIMARY KEY,
  CLIENTE            VARCHAR(20)    NOT NULL,          -- erpadmin.cliente.COD_CLT
  ALCANCE            CHAR(1)        NOT NULL,          -- 'A' artículo, 'L' línea (CLASIFICACION3), 'T' texto en la descripción
  VALOR              VARCHAR(60)    NOT NULL,          -- código artículo | código de línea | texto (ej. CREDELIO)
  DESCUENTO_MAX      DECIMAL(5,2)   NULL,              -- 0..100 (%)
  PRECIO_ESPECIAL    DECIMAL(28,8)  NULL,              -- $ sin IVA
  CANTIDAD_MIN       INT            NULL,              -- "a partir de N unidades"
  FECHA_INICIO       DATE           NOT NULL,
  FECHA_FIN          DATE           NULL,              -- NULL = sin vencimiento
  ACTIVA             CHAR(1)        NOT NULL DEFAULT 'S',
  NOTAS              VARCHAR(250)   NULL,
  USUARIO_CREACION   VARCHAR(50)    NULL,
  FECHA_CREACION     DATETIME       NOT NULL DEFAULT GETDATE(),
  USUARIO_MODIF      VARCHAR(50)    NULL,
  FECHA_MODIF        DATETIME       NULL,
  CONSTRAINT CK_FR_COND_ALCANCE CHECK (ALCANCE IN ('A','L','T')),
  CONSTRAINT CK_FR_COND_ACTIVA  CHECK (ACTIVA IN ('S','N')),
  -- uno y solo uno: descuento máximo O precio especial
  CONSTRAINT CK_FR_COND_VALOR   CHECK (
    (DESCUENTO_MAX IS NOT NULL AND PRECIO_ESPECIAL IS NULL) OR
    (DESCUENTO_MAX IS NULL AND PRECIO_ESPECIAL IS NOT NULL))
);
CREATE INDEX IX_FR_COND_CLIENTE ON erpadmin.FR_CONDICION_CLIENTE (CLIENTE, FECHA_INICIO, FECHA_FIN);
```

```sql
-- 3.2 Promociones (encabezado)
CREATE TABLE erpadmin.FR_PROMOCION (
  ID                   INT IDENTITY(1,1) PRIMARY KEY,
  TITULO               VARCHAR(120)   NOT NULL,        -- lo que ve el vendedor: "Compre 1 caja de Credelio y llévese 1 Jabón Asuntol"
  DESCRIPCION          VARCHAR(500)   NULL,
  TIPO                 CHAR(1)        NOT NULL,        -- 'D' descuento %, 'P' precio especial, 'B' bonificación
  FECHA_INICIO         DATE           NOT NULL,
  FECHA_FIN            DATE           NOT NULL,
  DESTINO              CHAR(1)        NOT NULL DEFAULT 'T', -- 'T' todos, 'R' rutas, 'K' tipos de cliente, 'C' clientes
  ARTICULO_BONIFICADO  VARCHAR(20)    NULL,            -- solo TIPO 'B': artículo que se regala
  CANTIDAD_BONIFICADA  INT            NULL,            -- solo TIPO 'B'
  ACTIVA               CHAR(1)        NOT NULL DEFAULT 'S',
  USUARIO_CREACION     VARCHAR(50)    NULL,
  FECHA_CREACION       DATETIME       NOT NULL DEFAULT GETDATE(),
  USUARIO_MODIF        VARCHAR(50)    NULL,
  FECHA_MODIF          DATETIME       NULL,
  CONSTRAINT CK_FR_PROMO_TIPO    CHECK (TIPO IN ('D','P','B')),
  CONSTRAINT CK_FR_PROMO_DESTINO CHECK (DESTINO IN ('T','R','K','C')),
  CONSTRAINT CK_FR_PROMO_ACTIVA  CHECK (ACTIVA IN ('S','N')),
  CONSTRAINT CK_FR_PROMO_FECHAS  CHECK (FECHA_FIN >= FECHA_INICIO)
);

-- 3.3 Productos de la promoción (a qué productos aplica / qué hay que comprar)
CREATE TABLE erpadmin.FR_PROMOCION_PRODUCTO (
  ID               INT IDENTITY(1,1) PRIMARY KEY,
  PROMOCION_ID     INT            NOT NULL REFERENCES erpadmin.FR_PROMOCION(ID) ON DELETE CASCADE,
  ALCANCE          CHAR(1)        NOT NULL,            -- 'A' artículo, 'L' línea, 'T' texto
  VALOR            VARCHAR(60)    NOT NULL,
  CANTIDAD_MIN     INT            NULL,                -- "compre N"
  DESCUENTO        DECIMAL(5,2)   NULL,                -- TIPO 'D'
  PRECIO_ESPECIAL  DECIMAL(28,8)  NULL,                -- TIPO 'P' ($ sin IVA)
  CONSTRAINT CK_FR_PPROD_ALCANCE CHECK (ALCANCE IN ('A','L','T'))
);

-- 3.4 A quién va dirigida (solo si DESTINO <> 'T')
CREATE TABLE erpadmin.FR_PROMOCION_DESTINO (
  PROMOCION_ID  INT          NOT NULL REFERENCES erpadmin.FR_PROMOCION(ID) ON DELETE CASCADE,
  TIPO          CHAR(1)      NOT NULL,                 -- 'R' ruta, 'K' tipo de cliente (COD_TIP_CL), 'C' cliente
  VALOR         VARCHAR(20)  NOT NULL,
  PRIMARY KEY (PROMOCION_ID, TIPO, VALOR)
);
```

**Ejemplos del correo con este modelo**

| Caso | Cómo se guarda |
|---|---|
| Cliente 07193: "Toda la línea CALOX: hasta 10 %" | `FR_CONDICION_CLIENTE` CLIENTE=07193, ALCANCE=L, VALOR=0010, DESCUENTO_MAX=10 |
| Cliente 07193: "Productos que dicen CREDELIO: hasta 10 %" | ALCANCE=T, VALOR=CREDELIO, DESCUENTO_MAX=10 |
| Cliente 00986: "CIPER-CLOR X 356 ML (16003): hasta 8 %" | ALCANCE=A, VALOR=16003, DESCUENTO_MAX=8 |
| Cliente 00212: "CALOX hasta 10 % · vigente hasta 31/12/2026" | ALCANCE=L, VALOR=0010, DESCUENTO_MAX=10, FECHA_FIN=2026-12-31 |
| "Compre 1 CARPROFENO X 100 TAB y llévese GRATIS 1 CARPROFENO X 10 TAB" | `FR_PROMOCION` TIPO=B, ARTICULO_BONIFICADO=(cód. x10), CANTIDAD_BONIFICADA=1 + producto ALCANCE=A, VALOR=(cód. x100), CANTIDAD_MIN=1 |
| "Credelio + 112.5 mg al precio de Credelio 112.5 mg" | TIPO=P + producto ALCANCE=A, VALOR=15064, PRECIO_ESPECIAL=(precio de 15057) |
| Descuento de temporada "Toda la línea Calox 15 % en diciembre" | TIPO=D, FECHA 2026-12-01..2026-12-31, DESTINO=T + producto ALCANCE=L, VALOR=0010, DESCUENTO=15 |

## 4. Estado (calculado, no se guarda)

Para cualquier fecha `F` (por defecto hoy, hora de El Salvador):

| ESTADO | Condición |
|---|---|
| `INACTIVA` | `ACTIVA = 'N'` |
| `PROGRAMADA` | `ACTIVA = 'S'` y `F < FECHA_INICIO` |
| `VIGENTE` | `ACTIVA = 'S'` y `FECHA_INICIO <= F` y (`FECHA_FIN IS NULL` o `F <= FECHA_FIN`) |
| `VENCIDA` | `ACTIVA = 'S'` y `FECHA_FIN < F` |

Las fechas son **inclusivas** (una promoción que termina el 31/12 aplica todo el 31/12).

## 5. Endpoints (montar en `routes/fr/index.js`, detrás de `authMiddleware, checkRol(["Admin"])`)

> Recordatorio: `routes/fr/index.js` **no** carga rutas automáticamente; cada archivo nuevo necesita
> su `router.use(...)` o devuelve 404.

Formato de respuesta igual que el resto de FR: `{ success, errors: [], result, pagination? }`
(paginación de `utils/paginacion.js`, máx. 100). Cuerpos en **camelCase**; respuestas con nombres de
columna en MAYÚSCULAS (igual que `rutaAsignadaRt`).

### 5.1 Condiciones por cliente — `routes/fr/condicionCliente.js`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/fr/condicionCliente` | Lista paginada. Query: `cliente`, `agente`, `ruta`, `estado` (`VIGENTE`/`PROGRAMADA`/`VENCIDA`/`INACTIVA`), `q` (busca en cliente, nombre o valor), `fecha` (YYYY-MM-DD para calcular estado, default hoy), `page`, `limit` |
| GET | `/fr/condicionCliente/:id` | Una condición |
| POST | `/fr/condicionCliente` | Crear |
| PUT | `/fr/condicionCliente/:id` | Editar (también para activar/desactivar) |
| DELETE | `/fr/condicionCliente/:id` | Eliminar (botón "Quitar") |

**Fila de respuesta (GET):**
```json
{
  "ID": 12, "CLIENTE": "07193", "CLIENTE_NOMBRE": "AGROSERVICIO EL GATO AGRICOLA, S.A. DE C.V.",
  "ALCANCE": "L", "VALOR": "0010", "VALOR_DESCRIPCION": "Productos Vet Calox",
  "DESCUENTO_MAX": 10, "PRECIO_ESPECIAL": null, "CANTIDAD_MIN": null,
  "FECHA_INICIO": "2026-11-01", "FECHA_FIN": "2026-12-31", "ACTIVA": "S", "NOTAS": null,
  "ESTADO": "VIGENTE",
  "RUTAS": "001, 004",            
  "AGENTE": "AG03", "AGENTE_NOMBRE": "Juan Carlos Guardado",
  "EN_CARTERA": true,
  "USUARIO_CREACION": "admin", "FECHA_CREACION": "2026-11-11T10:30:00"
}
```
- `VALOR_DESCRIPCION`: ALCANCE A → `ARTICULO.DES_ART`; L → `CINCOH.CLASIFICACION.DESCRIPCION` (AGRUPACION 3); T → el mismo texto.
- `RUTAS` / `AGENTE*`: de `RUTA_CLIENTE` + `RUTA_ASIGNADA_RT` (+ nombre del agente como ya hace `/fr/agenteAsocRt`). Si el cliente está en varias rutas, el agente de la primera.
- `EN_CARTERA`: `false` si el cliente no está en ninguna ruta (la pantalla muestra "aún no está en la cartera: aplicará cuando lo agreguen a la ruta").

**Cuerpo POST/PUT:**
```json
{
  "cliente": "07193", "alcance": "L", "valor": "0010",
  "descuentoMax": 10, "precioEspecial": null, "cantidadMin": null,
  "fechaInicio": "2026-11-01", "fechaFin": "2026-12-31", "activa": "S", "notas": null
}
```
**Validaciones (400 con mensaje en `errors`):**
- `cliente` existe en `erpadmin.cliente.COD_CLT`.
- `alcance` ∈ A/L/T. Si A → `valor` existe en `ARTICULO.COD_ART`; si L → existe en `CINCOH.CLASIFICACION` AGRUPACION 3; si T → mínimo 3 caracteres, se guarda en MAYÚSCULAS.
- Uno y solo uno de `descuentoMax` (0 < x ≤ 100) o `precioEspecial` (> 0).
- `cantidadMin` vacío o entero > 0.
- `fechaFin` vacía o ≥ `fechaInicio`.
- **No duplicar**: mismo cliente + alcance + valor con fechas que se traslapen y ambas activas → 400 "Ya existe una condición para ese cliente y producto en esas fechas".
- `USUARIO_CREACION` / `USUARIO_MODIF` salen del token.

### 5.2 Promociones — `routes/fr/promocion.js`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/fr/promocion` | Lista paginada. Query: `estado`, `tipo`, `q` (título), `fecha`, `page`, `limit`. Cada fila trae `productos` y `destinos` |
| GET | `/fr/promocion/:id` | Encabezado + `productos[]` + `destinos[]` |
| POST | `/fr/promocion` | Crear (encabezado + hijos en **una transacción**) |
| PUT | `/fr/promocion/:id` | Editar: reemplaza `productos` y `destinos` completos (borrar e insertar en transacción) |
| DELETE | `/fr/promocion/:id` | Eliminar (cascada) |

**Fila de respuesta:**
```json
{
  "ID": 3, "TITULO": "Compra 1 CARPROFENO X 100 TAB y llévese GRATIS 1 CARPROFENO X 10 TAB",
  "DESCRIPCION": null, "TIPO": "B",
  "FECHA_INICIO": "2026-11-01", "FECHA_FIN": "2026-11-30", "DESTINO": "T",
  "ARTICULO_BONIFICADO": "16110", "ARTICULO_BONIFICADO_DESCRIPCION": "CARPROFENO X 10 TAB",
  "CANTIDAD_BONIFICADA": 1, "ACTIVA": "S", "ESTADO": "VIGENTE",
  "productos": [
    { "ID": 7, "ALCANCE": "A", "VALOR": "16111", "VALOR_DESCRIPCION": "CARPROFENO X 100 TAB",
      "CANTIDAD_MIN": 1, "DESCUENTO": null, "PRECIO_ESPECIAL": null }
  ],
  "destinos": [ { "TIPO": "R", "VALOR": "001", "DESCRIPCION": "Ruta Cabañas" } ]
}
```
**Cuerpo POST/PUT:**
```json
{
  "titulo": "...", "descripcion": null, "tipo": "B",
  "fechaInicio": "2026-11-01", "fechaFin": "2026-11-30", "destino": "T",
  "articuloBonificado": "16110", "cantidadBonificada": 1, "activa": "S",
  "productos": [ { "alcance": "A", "valor": "16111", "cantidadMin": 1, "descuento": null, "precioEspecial": null } ],
  "destinos":  [ { "tipo": "R", "valor": "001" } ]
}
```
**Validaciones:**
- `titulo` obligatorio (≤ 120). `fechaInicio` y `fechaFin` obligatorias, `fechaFin ≥ fechaInicio`.
- Al menos 1 producto. Mismas reglas de `alcance`/`valor` que en condiciones.
- TIPO `D`: cada producto con `descuento` 0 < x ≤ 100. TIPO `P`: cada producto con `precioEspecial` > 0.
  TIPO `B`: `articuloBonificado` existe y `cantidadBonificada` > 0; productos con `cantidadMin` > 0.
- `destino` ≠ T → al menos 1 destino; R valida contra `RUTA_RT`, K contra `alFAC_TIP_CLT`, C contra `erpadmin.cliente`.

### 5.3 Catálogo de líneas — en el mismo archivo o `routes/fr/lineaArticulo.js`

| GET | `/fr/lineaArticulo` | `SELECT CLASIFICACION, DESCRIPCION FROM CINCOH.CLASIFICACION WHERE AGRUPACION = 3 ORDER BY DESCRIPCION` (sin paginar, son pocas) |
|---|---|---|

### 5.3b Catálogo de tipos de cliente

| GET | `/fr/tipoCliente` | `SELECT COD_TIP_CL, DES_TIP_CL FROM erpadmin.alFAC_TIP_CLT ORDER BY DES_TIP_CL` (sin paginar). Se usa en el destino "Tipos de cliente" de las promociones. Hoy solo existe dentro de `/fr/sync/clientes` (token móvil), no hay GET para la web. |
|---|---|---|

### 5.4 Consulta de precio — `GET /fr/precioVigente?cliente=&articulo=&fecha=&cantidad=`

Sirve para que la administración verifique qué precio verá el vendedor un día dado. **La misma
función de cálculo debe usarse luego en la sincronización de la app** (ponerla en `utils/`, p. ej.
`utils/precioFr.js`).

```json
{
  "CLIENTE": "07193", "ARTICULO": "16001", "ARTICULO_DESCRIPCION": "ALBENDAZOL 20% X 100 ML",
  "LINEA": "0010", "NIVEL_PRECIO": "DISTRIBUIDOR", "FECHA": "2026-12-05",
  "PRECIO_BASE": 6.40, "IVA": 0.13,
  "PRECIO_FINAL": 5.44, "PRECIO_FINAL_IVA": 6.15,
  "REGLA_APLICADA": { "ORIGEN": "PROMOCION", "ID": 4, "DESCRIPCION": "Calox 15 % diciembre", "DESCUENTO": 15, "PRECIO_ESPECIAL": null },
  "REGLAS_CANDIDATAS": [
    { "ORIGEN": "CONDICION", "ID": 12, "DESCRIPCION": "Toda la línea Calox hasta 10 %", "DESCUENTO": 10, "PRECIO_ESPECIAL": null, "PRECIO_RESULTANTE": 5.76 },
    { "ORIGEN": "PROMOCION", "ID": 4,  "DESCRIPCION": "Calox 15 % diciembre", "DESCUENTO": 15, "PRECIO_ESPECIAL": null, "PRECIO_RESULTANTE": 5.44 }
  ],
  "BONIFICACIONES": []
}
```

**Algoritmo:**
1. Precio base = `ARTICULO_PRECIO` del artículo con `NIVEL_PRECIO` del cliente (moneda dólar).
2. Candidatas = condiciones del cliente + promociones cuyo destino incluya al cliente
   (T, su ruta, su `COD_TIP_CL` o él mismo), **ACTIVA = 'S' y vigentes en `fecha`**, cuyo alcance
   coincida con el artículo (A = código igual; L = `CLASIFICACION3` igual; T = `DES_ART LIKE '%texto%'`)
   y cuya `CANTIDAD_MIN` sea ≤ `cantidad` (si se envía).
3. Precio resultante de cada candidata: descuento → `base × (1 − %/100)`; precio especial → ese precio.
4. **Si hay varias, gana la de precio resultante más bajo** (la mejor para el cliente).
   No se suman descuentos.
   *(Si COAGRO decide otra regla — "la condición del cliente siempre gana" — solo cambia este paso.)*
5. En condiciones de cliente el % es **máximo autorizado**: el vendedor puede dar menos, no más.
   `PRECIO_FINAL` muestra el precio con el máximo.
6. Bonificaciones (TIPO B) no cambian el precio: se devuelven en `BONIFICACIONES` si el artículo
   está en sus productos.

## 6. Fase 2 (cuando el equipo de la app esté listo): sincronización

`GET /fr/sync/promociones` (token móvil, mismo middleware que `/fr/sync/*`):
- `condiciones`: de los clientes de las rutas de la handheld, `ACTIVA='S'` y con `FECHA_FIN` nula o ≥ hoy (incluye programadas, así la app las aplica sola cuando inicien sin volver a sincronizar).
- `promociones` (+ `productos`, `destinos`): `ACTIVA='S'`, `FECHA_FIN ≥ hoy` y `FECHA_INICIO ≤ hoy + 30 días`, que apliquen a alguna ruta/cliente de la handheld.
- `lineas`: el catálogo de 5.3.
- La app aplica el mismo algoritmo de 5.4 con la fecha del dispositivo.
- Recomendado: guardar en el detalle del pedido qué regla se aplicó (ORIGEN + ID) para reportes.

## 7. Pendientes relacionados (pequeños)

- **Montar `/fr/efectividadVisita`** en `routes/fr/index.js`: el archivo de ruta existe pero no está
  montado (da 404). Lo necesita la pantalla *Razones de Visita* para cargar los motivos de no venta.
- `EFECT_VISITA_RT.DESCRIPCION` es `varchar(20)`: "Sin presupuesto / sin pago" (26) no cabe.
  Ampliar a `varchar(60)` o acortar el texto.

## 8. Checklist de entrega

- [ ] Script SQL de las 4 tablas (sección 3) ejecutado en COAGRO2.
- [ ] Modelos Sequelize en `models/fr/` y registrados en `models/index.js`.
- [ ] `controllers/fr/condicionCliente.js` + `routes/fr/condicionCliente.js` (5.1).
- [ ] `controllers/fr/promocion.js` + `routes/fr/promocion.js` (5.2).
- [ ] `GET /fr/lineaArticulo` (5.3).
- [ ] `GET /fr/tipoCliente` (5.3b).
- [ ] `utils/precioFr.js` + `GET /fr/precioVigente` (5.4).
- [ ] Todas las rutas agregadas en `routes/fr/index.js`.
- [ ] Montar `/fr/efectividadVisita` (7).
- [ ] Avisar al frontend: se cambia `BACKEND_DISPONIBLE = true` en los servicios y queda conectado.
