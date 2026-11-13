/* =====================================================================================
   FR (Ruteo) - Condiciones especiales por cliente y Promociones de temporada
   Base: COAGRO2   Esquema: erpadmin   Motor: SQL Server
   Detalle funcional: docs/fr/backend-condiciones-promociones.md

   - Se puede ejecutar varias veces: solo crea lo que no existe.
   - No modifica ninguna tabla existente del ERP ni de Softland (salvo el punto 5, opcional).
   - Regla de negocio: el precio base (ARTICULO_PRECIO) NUNCA se toca; estas tablas son
     reglas con fecha de inicio y fin que se aplican al calcular el precio.
   ===================================================================================== */

USE COAGRO2;
GO

/* -------------------------------------------------------------------------------------
   1) FR_CONDICION_CLIENTE
      Descuento maximo O precio especial que se le autoriza a UN cliente para:
        ALCANCE 'A' = un articulo        (VALOR = ARTICULO.COD_ART, ej. '16003')
        ALCANCE 'L' = una linea completa (VALOR = ARTICULO.CLASIFICACION3, ej. '0010' = Vet Calox)
        ALCANCE 'T' = texto en el nombre (VALOR = texto en MAYUSCULAS, ej. 'CREDELIO')
   ------------------------------------------------------------------------------------- */
IF OBJECT_ID('erpadmin.FR_CONDICION_CLIENTE', 'U') IS NULL
BEGIN
  CREATE TABLE erpadmin.FR_CONDICION_CLIENTE (
    ID                 INT IDENTITY(1,1) NOT NULL,
    CLIENTE            VARCHAR(20)    NOT NULL,              -- erpadmin.cliente.COD_CLT
    ALCANCE            CHAR(1)        NOT NULL,              -- 'A' | 'L' | 'T'
    VALOR              VARCHAR(60)    NOT NULL,
    DESCUENTO_MAX      DECIMAL(5,2)   NULL,                  -- % (0 < x <= 100)
    PRECIO_ESPECIAL    DECIMAL(28,8)  NULL,                  -- $ sin IVA
    CANTIDAD_MIN       INT            NULL,                  -- "a partir de N unidades"
    FECHA_INICIO       DATE           NOT NULL,
    FECHA_FIN          DATE           NULL,                  -- NULL = sin vencimiento
    ACTIVA             CHAR(1)        NOT NULL CONSTRAINT DF_FR_COND_ACTIVA DEFAULT ('S'),
    NOTAS              VARCHAR(250)   NULL,
    USUARIO_CREACION   VARCHAR(50)    NULL,
    FECHA_CREACION     DATETIME       NOT NULL CONSTRAINT DF_FR_COND_FCREA DEFAULT (GETDATE()),
    USUARIO_MODIF      VARCHAR(50)    NULL,
    FECHA_MODIF        DATETIME       NULL,

    CONSTRAINT PK_FR_CONDICION_CLIENTE PRIMARY KEY (ID),
    CONSTRAINT CK_FR_COND_ALCANCE  CHECK (ALCANCE IN ('A','L','T')),
    CONSTRAINT CK_FR_COND_ACTIVA   CHECK (ACTIVA IN ('S','N')),
    CONSTRAINT CK_FR_COND_FECHAS   CHECK (FECHA_FIN IS NULL OR FECHA_FIN >= FECHA_INICIO),
    CONSTRAINT CK_FR_COND_DESC     CHECK (DESCUENTO_MAX IS NULL OR (DESCUENTO_MAX > 0 AND DESCUENTO_MAX <= 100)),
    CONSTRAINT CK_FR_COND_PRECIO   CHECK (PRECIO_ESPECIAL IS NULL OR PRECIO_ESPECIAL > 0),
    CONSTRAINT CK_FR_COND_CANT     CHECK (CANTIDAD_MIN IS NULL OR CANTIDAD_MIN > 0),
    -- uno y solo uno: descuento maximo O precio especial
    CONSTRAINT CK_FR_COND_VALOR    CHECK (
      (DESCUENTO_MAX IS NOT NULL AND PRECIO_ESPECIAL IS NULL) OR
      (DESCUENTO_MAX IS NULL     AND PRECIO_ESPECIAL IS NOT NULL))
  );

  CREATE INDEX IX_FR_COND_CLIENTE ON erpadmin.FR_CONDICION_CLIENTE (CLIENTE, ACTIVA, FECHA_INICIO, FECHA_FIN);
END
GO

/* -------------------------------------------------------------------------------------
   2) FR_PROMOCION  (encabezado)
      TIPO    'D' = descuento %   'P' = precio especial   'B' = bonificacion (compre X lleve Y)
      DESTINO 'T' = todos los clientes
              'R' = ciertas rutas / 'K' = ciertos tipos de cliente / 'C' = ciertos clientes
              (cuando no es 'T', el detalle va en FR_PROMOCION_DESTINO)
   ------------------------------------------------------------------------------------- */
IF OBJECT_ID('erpadmin.FR_PROMOCION', 'U') IS NULL
BEGIN
  CREATE TABLE erpadmin.FR_PROMOCION (
    ID                   INT IDENTITY(1,1) NOT NULL,
    TITULO               VARCHAR(120)   NOT NULL,            -- texto que ve el vendedor
    DESCRIPCION          VARCHAR(500)   NULL,
    TIPO                 CHAR(1)        NOT NULL,            -- 'D' | 'P' | 'B'
    FECHA_INICIO         DATE           NOT NULL,
    FECHA_FIN            DATE           NOT NULL,
    DESTINO              CHAR(1)        NOT NULL CONSTRAINT DF_FR_PROMO_DESTINO DEFAULT ('T'),
    ARTICULO_BONIFICADO  VARCHAR(20)    NULL,                -- solo TIPO 'B' (ARTICULO.COD_ART)
    CANTIDAD_BONIFICADA  INT            NULL,                -- solo TIPO 'B'
    ACTIVA               CHAR(1)        NOT NULL CONSTRAINT DF_FR_PROMO_ACTIVA DEFAULT ('S'),
    USUARIO_CREACION     VARCHAR(50)    NULL,
    FECHA_CREACION       DATETIME       NOT NULL CONSTRAINT DF_FR_PROMO_FCREA DEFAULT (GETDATE()),
    USUARIO_MODIF        VARCHAR(50)    NULL,
    FECHA_MODIF          DATETIME       NULL,

    CONSTRAINT PK_FR_PROMOCION PRIMARY KEY (ID),
    CONSTRAINT CK_FR_PROMO_TIPO    CHECK (TIPO IN ('D','P','B')),
    CONSTRAINT CK_FR_PROMO_DESTINO CHECK (DESTINO IN ('T','R','K','C')),
    CONSTRAINT CK_FR_PROMO_ACTIVA  CHECK (ACTIVA IN ('S','N')),
    CONSTRAINT CK_FR_PROMO_FECHAS  CHECK (FECHA_FIN >= FECHA_INICIO),
    CONSTRAINT CK_FR_PROMO_BONIF   CHECK (
      (TIPO = 'B' AND ARTICULO_BONIFICADO IS NOT NULL AND CANTIDAD_BONIFICADA > 0) OR
      (TIPO <> 'B' AND ARTICULO_BONIFICADO IS NULL AND CANTIDAD_BONIFICADA IS NULL))
  );

  CREATE INDEX IX_FR_PROMO_FECHAS ON erpadmin.FR_PROMOCION (ACTIVA, FECHA_INICIO, FECHA_FIN);
END
GO

/* -------------------------------------------------------------------------------------
   3) FR_PROMOCION_PRODUCTO  (a que productos aplica / que hay que comprar)
      Mismo ALCANCE/VALOR que en FR_CONDICION_CLIENTE.
      TIPO 'D' -> DESCUENTO obligatorio   TIPO 'P' -> PRECIO_ESPECIAL obligatorio
      TIPO 'B' -> CANTIDAD_MIN = cuantas hay que comprar
      (esa regla por tipo se valida en el backend, porque depende del encabezado)
   ------------------------------------------------------------------------------------- */
IF OBJECT_ID('erpadmin.FR_PROMOCION_PRODUCTO', 'U') IS NULL
BEGIN
  CREATE TABLE erpadmin.FR_PROMOCION_PRODUCTO (
    ID               INT IDENTITY(1,1) NOT NULL,
    PROMOCION_ID     INT            NOT NULL,
    ALCANCE          CHAR(1)        NOT NULL,                -- 'A' | 'L' | 'T'
    VALOR            VARCHAR(60)    NOT NULL,
    CANTIDAD_MIN     INT            NULL,
    DESCUENTO        DECIMAL(5,2)   NULL,                    -- %  (TIPO 'D')
    PRECIO_ESPECIAL  DECIMAL(28,8)  NULL,                    -- $ sin IVA (TIPO 'P')

    CONSTRAINT PK_FR_PROMOCION_PRODUCTO PRIMARY KEY (ID),
    CONSTRAINT FK_FR_PPROD_PROMO FOREIGN KEY (PROMOCION_ID)
      REFERENCES erpadmin.FR_PROMOCION (ID) ON DELETE CASCADE,
    CONSTRAINT CK_FR_PPROD_ALCANCE CHECK (ALCANCE IN ('A','L','T')),
    CONSTRAINT CK_FR_PPROD_DESC    CHECK (DESCUENTO IS NULL OR (DESCUENTO > 0 AND DESCUENTO <= 100)),
    CONSTRAINT CK_FR_PPROD_PRECIO  CHECK (PRECIO_ESPECIAL IS NULL OR PRECIO_ESPECIAL > 0),
    CONSTRAINT CK_FR_PPROD_CANT    CHECK (CANTIDAD_MIN IS NULL OR CANTIDAD_MIN > 0)
  );

  CREATE INDEX IX_FR_PPROD_PROMO ON erpadmin.FR_PROMOCION_PRODUCTO (PROMOCION_ID);
END
GO

/* -------------------------------------------------------------------------------------
   4) FR_PROMOCION_DESTINO  (a quien va dirigida, solo si FR_PROMOCION.DESTINO <> 'T')
      TIPO 'R' = ruta (RUTA_RT.RUTA)
           'K' = tipo de cliente (alFAC_TIP_CLT.COD_TIP_CL)
           'C' = cliente (cliente.COD_CLT)
   ------------------------------------------------------------------------------------- */
IF OBJECT_ID('erpadmin.FR_PROMOCION_DESTINO', 'U') IS NULL
BEGIN
  CREATE TABLE erpadmin.FR_PROMOCION_DESTINO (
    PROMOCION_ID  INT          NOT NULL,
    TIPO          CHAR(1)      NOT NULL,                     -- 'R' | 'K' | 'C'
    VALOR         VARCHAR(20)  NOT NULL,

    CONSTRAINT PK_FR_PROMOCION_DESTINO PRIMARY KEY (PROMOCION_ID, TIPO, VALOR),
    CONSTRAINT FK_FR_PDEST_PROMO FOREIGN KEY (PROMOCION_ID)
      REFERENCES erpadmin.FR_PROMOCION (ID) ON DELETE CASCADE,
    CONSTRAINT CK_FR_PDEST_TIPO CHECK (TIPO IN ('R','K','C'))
  );
END
GO

/* -------------------------------------------------------------------------------------
   5) (OPCIONAL) Motivos de no venta: ampliar la descripcion de las razones de visita
      de 20 a 60 caracteres ("Sin presupuesto / sin pago" no cabe en 20).
      Revisar antes con el equipo si Softland / la handheld dependen del largo 20.
   ------------------------------------------------------------------------------------- */
-- ALTER TABLE erpadmin.EFECT_VISITA_RT ALTER COLUMN DESCRIPCION VARCHAR(60) NOT NULL;
-- GO

/* -------------------------------------------------------------------------------------
   6) DATOS DE EJEMPLO (opcional, para probar). Son los casos del correo de COAGRO.
      Para ejecutarlos, quitar las marcas de comentario que encierran el bloque de abajo.
   ------------------------------------------------------------------------------------- */
/*
INSERT INTO erpadmin.FR_CONDICION_CLIENTE (CLIENTE, ALCANCE, VALOR, DESCUENTO_MAX, FECHA_INICIO, FECHA_FIN, USUARIO_CREACION)
VALUES ('00986', 'A', '16003',    8,  '2026-11-01', NULL,         'script'),
       ('07193', 'T', 'CREDELIO', 10, '2026-11-01', NULL,         'script'),
       ('07193', 'T', 'BRAVECTO', 10, '2026-11-01', NULL,         'script'),
       ('07193', 'L', '0010',     10, '2026-11-01', NULL,         'script'),
       ('06018', 'L', '0007',     5,  '2026-11-01', NULL,         'script'),
       ('06018', 'L', '0010',     7,  '2026-11-01', NULL,         'script'),
       ('00212', 'L', '0010',     10, '2026-11-01', '2026-12-31', 'script');

DECLARE @promo INT;
INSERT INTO erpadmin.FR_PROMOCION (TITULO, TIPO, FECHA_INICIO, FECHA_FIN, DESTINO, USUARIO_CREACION)
VALUES ('Calox 15 % en diciembre', 'D', '2026-12-01', '2026-12-31', 'T', 'script');
SET @promo = SCOPE_IDENTITY();
INSERT INTO erpadmin.FR_PROMOCION_PRODUCTO (PROMOCION_ID, ALCANCE, VALOR, DESCUENTO)
VALUES (@promo, 'L', '0010', 15);
*/

/* -------------------------------------------------------------------------------------
   7) Consultas de apoyo que usan los endpoints
   ------------------------------------------------------------------------------------- */
-- Lineas (GET /fr/lineaArticulo):
--   SELECT CLASIFICACION, DESCRIPCION FROM COAGRO2.CINCOH.CLASIFICACION WHERE AGRUPACION = 3 ORDER BY DESCRIPCION;
-- Tipos de cliente (GET /fr/tipoCliente):
--   SELECT COD_TIP_CL, DES_TIP_CL FROM COAGRO2.erpadmin.alFAC_TIP_CLT ORDER BY DES_TIP_CL;
-- Estado de una regla a la fecha @F (no se guarda, se calcula):
--   CASE WHEN ACTIVA = 'N' THEN 'INACTIVA'
--        WHEN @F < FECHA_INICIO THEN 'PROGRAMADA'
--        WHEN FECHA_FIN IS NOT NULL AND FECHA_FIN < @F THEN 'VENCIDA'
--        ELSE 'VIGENTE' END
