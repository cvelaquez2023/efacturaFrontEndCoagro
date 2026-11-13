/*
 * Modelos Sequelize para las tablas de 01_fr_condiciones_promociones.sql
 * Mismo estilo que models/fr/*.js del backend (schema ERPADMIN, sin timestamps).
 *
 * Cómo usarlos:
 *   1. Copiar cada bloque a su archivo en models/fr/:
 *        models/fr/FrCondicionCliente.js
 *        models/fr/FrPromocion.js
 *        models/fr/FrPromocionProducto.js
 *        models/fr/FrPromocionDestino.js
 *   2. Registrarlos en models/index.js:
 *        frCondicionClienteModel:   require("./fr/FrCondicionCliente"),
 *        frPromocionModel:          require("./fr/FrPromocion"),
 *        frPromocionProductoModel:  require("./fr/FrPromocionProducto"),
 *        frPromocionDestinoModel:   require("./fr/FrPromocionDestino"),
 *   3. Las relaciones (hasMany) van al final de este archivo.
 */

/* ===================== models/fr/FrCondicionCliente.js ===================== */
const { sequelize } = require("../../config/mssql");
const { DataTypes } = require("sequelize");

const FrCondicionCliente = sequelize.define(
  "FR_CONDICION_CLIENTE",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    CLIENTE: { type: DataTypes.STRING(20), allowNull: false },
    ALCANCE: { type: DataTypes.CHAR(1), allowNull: false, validate: { isIn: [["A", "L", "T"]] } },
    VALOR: { type: DataTypes.STRING(60), allowNull: false },
    DESCUENTO_MAX: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    PRECIO_ESPECIAL: { type: DataTypes.DECIMAL(28, 8), allowNull: true },
    CANTIDAD_MIN: { type: DataTypes.INTEGER, allowNull: true },
    FECHA_INICIO: { type: DataTypes.DATEONLY, allowNull: false },
    FECHA_FIN: { type: DataTypes.DATEONLY, allowNull: true },
    ACTIVA: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: "S", validate: { isIn: [["S", "N"]] } },
    NOTAS: { type: DataTypes.STRING(250), allowNull: true },
    USUARIO_CREACION: { type: DataTypes.STRING(50), allowNull: true },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    USUARIO_MODIF: { type: DataTypes.STRING(50), allowNull: true },
    FECHA_MODIF: { type: DataTypes.DATE, allowNull: true },
  },
  { schema: "ERPADMIN", tableName: "FR_CONDICION_CLIENTE", timestamps: false }
);
module.exports = FrCondicionCliente;

/* ===================== models/fr/FrPromocion.js ===================== */
// const { sequelize } = require("../../config/mssql");
// const { DataTypes } = require("sequelize");

const FrPromocion = sequelize.define(
  "FR_PROMOCION",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TITULO: { type: DataTypes.STRING(120), allowNull: false },
    DESCRIPCION: { type: DataTypes.STRING(500), allowNull: true },
    TIPO: { type: DataTypes.CHAR(1), allowNull: false, validate: { isIn: [["D", "P", "B"]] } },
    FECHA_INICIO: { type: DataTypes.DATEONLY, allowNull: false },
    FECHA_FIN: { type: DataTypes.DATEONLY, allowNull: false },
    DESTINO: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: "T", validate: { isIn: [["T", "R", "K", "C"]] } },
    ARTICULO_BONIFICADO: { type: DataTypes.STRING(20), allowNull: true },
    CANTIDAD_BONIFICADA: { type: DataTypes.INTEGER, allowNull: true },
    ACTIVA: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: "S", validate: { isIn: [["S", "N"]] } },
    USUARIO_CREACION: { type: DataTypes.STRING(50), allowNull: true },
    FECHA_CREACION: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    USUARIO_MODIF: { type: DataTypes.STRING(50), allowNull: true },
    FECHA_MODIF: { type: DataTypes.DATE, allowNull: true },
  },
  { schema: "ERPADMIN", tableName: "FR_PROMOCION", timestamps: false }
);
// module.exports = FrPromocion;

/* ===================== models/fr/FrPromocionProducto.js ===================== */
const FrPromocionProducto = sequelize.define(
  "FR_PROMOCION_PRODUCTO",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    PROMOCION_ID: { type: DataTypes.INTEGER, allowNull: false },
    ALCANCE: { type: DataTypes.CHAR(1), allowNull: false, validate: { isIn: [["A", "L", "T"]] } },
    VALOR: { type: DataTypes.STRING(60), allowNull: false },
    CANTIDAD_MIN: { type: DataTypes.INTEGER, allowNull: true },
    DESCUENTO: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    PRECIO_ESPECIAL: { type: DataTypes.DECIMAL(28, 8), allowNull: true },
  },
  { schema: "ERPADMIN", tableName: "FR_PROMOCION_PRODUCTO", timestamps: false }
);
// module.exports = FrPromocionProducto;

/* ===================== models/fr/FrPromocionDestino.js ===================== */
const FrPromocionDestino = sequelize.define(
  "FR_PROMOCION_DESTINO",
  {
    PROMOCION_ID: { type: DataTypes.INTEGER, primaryKey: true },
    TIPO: { type: DataTypes.CHAR(1), primaryKey: true, validate: { isIn: [["R", "K", "C"]] } },
    VALOR: { type: DataTypes.STRING(20), primaryKey: true },
  },
  { schema: "ERPADMIN", tableName: "FR_PROMOCION_DESTINO", timestamps: false }
);
// module.exports = FrPromocionDestino;

/* ===================== Relaciones (p. ej. al final de models/index.js) ===================== */
// Para que GET /fr/promocion devuelva "productos" y "destinos" con include:
FrPromocion.hasMany(FrPromocionProducto, { as: "productos", foreignKey: "PROMOCION_ID", onDelete: "CASCADE" });
FrPromocion.hasMany(FrPromocionDestino, { as: "destinos", foreignKey: "PROMOCION_ID", onDelete: "CASCADE" });
FrPromocionProducto.belongsTo(FrPromocion, { foreignKey: "PROMOCION_ID" });
FrPromocionDestino.belongsTo(FrPromocion, { foreignKey: "PROMOCION_ID" });

/*
 * Ejemplo de uso en el controller (crear promoción con hijos en una transacción):
 *
 *   await sequelize.transaction(async (t) => {
 *     const promo = await frPromocionModel.create(encabezado, { transaction: t });
 *     await frPromocionProductoModel.bulkCreate(
 *       productos.map((p) => ({ ...p, PROMOCION_ID: promo.ID })), { transaction: t });
 *     await frPromocionDestinoModel.bulkCreate(
 *       destinos.map((d) => ({ ...d, PROMOCION_ID: promo.ID })), { transaction: t });
 *   });
 *
 * En PUT: destroy de productos/destinos de esa promoción + bulkCreate, dentro de la misma transacción.
 */
