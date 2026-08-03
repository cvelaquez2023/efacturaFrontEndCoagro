export interface IResponseArticulo {
	codArticulo: string;
	descripcion: string;
	clasificacion1Id: number;
	clasificacion2Id: number;
	clasificacion3Id: number;
	clasificacion4Id: number;
	clasificacion5Id: number;
	clasificacion6Id: number;
	catgoriaArticuloId: number;
}
export interface IResponseCliente {
	CLIENTE: string;
	NOMBRE: string;
	ALIAS: string;
	CONTACTO: string;
	CARGO: string;
	DIRECCION: string;
	TELEFONO1: string;
	CONTRIBUYENTE: string;
	FECHA_INGRESO: string;
	MULTIMONEDA: string;
	MONEDA: string;
	SALDO: number;
	SALDO_LOCAL: number;
	SALDO_DOLAR: number;
	SALDO_CREDITO: number;
	EXCEDER_LIMITE: string;
	TASA_INTERES: number;
	TASA_INTERES_MORA: number;
	FECHA_ULT_MOV: string;
	CONDICION_PAGO: string;
	NIVEL_PRECIO: string;
	DESCUENTO: number;
	MONEDA_NIVEL: string;
	ACEPTA_BACKORDER: string;
	PAIS: string;
	ZONA: string;
	RUTA: string;
	VENDEDOR: string;
	COBRADOR: string;
	ACEPTA_FRACCIONES: string;
	ACTIVO: string;
	EXENTO_IMPUESTOS: string;
	EXENCION_IMP1: number;
	EXENCION_IMP2: number;
	COBRO_JUDICIAL: string;
	CATEGORIA_CLIENTE: string;
	CLASE_ABC: string;
	DIAS_ABASTECIMIEN: number;
	USA_TARJETA: string;
	TARJETA_CREDITO: string;
	FECHA_VENCE_TARJ: string;
	E_MAIL: string;
	REQUIERE_OC: string;
	ES_CORPORACION: string;
	REGISTRARDOCSACORP: string;
	USAR_DIREMB_CORP: string;
	APLICAC_ABIERTAS: string;
	VERIF_LIMCRED_CORP: string;
	USAR_DESC_CORP: string;
	DOC_A_GENERAR: string;
	TIENE_CONVENIO: string;
	NOTAS: string;
	DIAS_PROMED_ATRASO: number;
	ASOCOBLIGCONTFACT: string;
	USAR_PRECIOS_CORP: string;
	USAR_EXENCIMP_CORP: string;
	AJUSTE_FECHA_COBRO: string;
	CLASE_DOCUMENTO: string;
	LOCAL: string;
	TIPO_CONTRIBUYENTE: string;
	ACEPTA_DOC_ELECTRONICO: string;
	CONFIRMA_DOC_ELECTRONICO: string;
	ACEPTA_DOC_EDI: string;
	NOTIFICAR_ERROR_EDI: string;
	CODIGO_IMPUESTO: string;
	MOROSO: string;
	MODIF_NOMB_EN_FAC: string;
	SALDO_TRANS: number;
	SALDO_TRANS_DOLAR: number;
	PERMITE_DOC_GP: string;
	PARTICIPA_FLUJOCAJA: string;
	DETALLAR_KITS: string;
	ES_EXTRANJERO: string;
	ES_AGENTE_PERCEPCION: string;
	ES_BUEN_CONTRIBUYENTE: string;
	SUJETO_PORCE_SUNAT: string;
	NRC: string;
	RUBRO2_CLI: string;
	RUBRO3_CLI: string;
	RUBRO4_CLI: string;
	RUBRO5_CLI: string;
	CORREODTE: string;
	CODACT: string;
	DESCACT: string;
}
export interface IResponseMoneda {
	MONEDA: string;
	NOMBRE: string;
}
export interface IResponseTipoDoc {
	TIPO: string;
}
export interface IResponseSubTipo {
	TIPO: string;
	SUBTIPO: number;
	DESCRIPCION: string;
	cat002: string;
}

export interface IResponseAsiento {
	detalle: {
		ASIENTO: string;
		CONSECUTIVO: number;
		NIT: string;
		CENTRO_COSTO: string;
		CUENTA_CONTABLE: string;
		FUENTE: string;
		REFERENCIA: string;
		DEBITO_LOCAL: number;
		CREDITO_LOCAL: number;
	};
	enca: {
		ASIENTO: string;
		CLASE_ASIENTO: string;
		FECHA: string;
		FECHA_CREACION: string;
		NOTAS: string;
		ORIGEN: string;
		PAQUETE: string;
		TIPO_ASIENTO: string;
		TOTAL_CREDITO_LOCAL: number;
		TOTAL_DEBITO_LOCAL: number;
	};
}
export interface IResponseLineaAsientos {
	ASIENTO: string;
	CONSECUTIVO: number;
	NIT: string;
	CENTRO_COSTO: string;
	CUENTA_CONTABLE: string;
	FUENTE: string;
	REFERENCIA: string;
	DEBITO_LOCAL: number;
	CREDITO_LOCAL: number;
}

export interface IResponseCondPago {
	CONDICION_PAGO: string;
	DESCRIPCION: string;
	DIAS_NETO: number;
	cat016: number;
	cat017: string;
	cat018: string;
}

export interface IResponseDtes {
	Dte_Id: string;
	Dte: string;
	nombre: string;
	procesado: boolean;
	tipoDoc: string;
	selloRecibido: string;
	codigoGeneracion: string;
	fechaemision: string;
	montoTotal: number;
	Documento: string;
	mudulo: string;
	estado: string;
	fechaProce: string;
}

export interface IResponseDteInvalidaciones {
	codigoGeneracion: string;
	selloRecibidoInva: string;
	fechaHoraInva: string;
	invalidado: boolean;
	documento: string;
	cliente_origen: string;
	nombre: string;
	monto: number;
	fecha: string;
	fecha_anulacion: string;
	horas: number;
}
export interface IResponseCrearInvalidacion {
	documento: string;
	tipoAnulacion: number;
	motivoAnulacion: string;
	nombreResponsable: string;
	tipoDocResponsable: string;
	numDocResponsable: string;
	nombreSolicita: string;
	numDocSolicita: string;
	tipoDocSolicita: string;
}
export interface IResponseReimpresion {
	dte: string;
	tipoDoc: string;
}

export interface IResponseEnvioMail {
	dte: string;
	correo: string;
}
export interface IResponseDteObser {
	descripcion: string;
}

export interface IResponseCentroCosto {
	CENTRO_COSTO: string;
	DESCRIPCION: string;
}

export interface IResponseVale {
	conse: number;
	vale: number;
}
export interface IResponseValeCajachica {
	CONSECUTIVO: number;
	DEPARTAMENTO: string;
	CAJA_CHICA: string;
	VALE: string;
	FECHA_EMISION: string;
	CONCEPTO_VALE: string;
	BENEFICIARIO: string;
	MONTO_CAJA: number;
	MONTO_LOCAL: number;
	MONTO_DOLAR: number;
	TIPO_CAMB_CAJA: number;
	TIPO_CAMB_DOLAR: number;
	ESTADO: string;
	USUARIO_CREACION: string;
	FECHA_CREACION: string;
	ADMIN_CREACION: string;
	USUARIO_MODIFIC: string;
	FECHA_MODIFIC: string;
	ADMIN_MODIFIC: string;
	MONTO_VALE: number;
	MONTO_EFECTIVO: number;
	REINTEGRO: number;
	FACTURA_ELECTRONICA: string;
	SUBTOTAL_BIENES: number;
	SUBTOTAL_SERVICIOS: number;
	DESTINO_ITBIS: string;
	TIPO_CF: string;
}
export interface IResponseAsientoLinea {
	ASIENTO: string;
	CONSECUTIVO: number;
	CENTRO_COSTO: string;
	DESCRIPCION: string;
	CUENTA_CONTABLE: string;
	DES: string;
	FUENTE: string;
	FUENTECORTA: string;
	REFERENCIA: string;
	REFERENCIACORTA: string;
	DEBITO_LOCAL: number;
	CREDITO_LOCAL: number;
}

export interface IResponseCajaChica {
	CAJA_CHICA: string;
	DESCRIPCION: string;
	SALDO: number;
	ULTIMO_CONSECUTIVO: number;
}
export interface IResponseDepartamento {
	DEPARTAMENTO: string;
	DESCRIPCION: string;
}

export interface IResponseConceptoVale {
	CONCEPTO_VALE: string;
	DESCRIPCION: string;
	CENTRO_COSTO: string;
	CUENTA_CONTABLE: string;
}

export interface IResponseBeneficiario {
	EMPLEADO: string;
	NOMBRE: string;
	ACTIVO: string;
}

export interface IResponseDtesCp {
	TipoDoc: string;
	subTipoDoc: string;
	codigoGeneracion: string;
	codigoImpuesto: string;
	condicion_pago: string;
	diasNeto: number;
	dte: string;
	fechaDoc: string;
	fechaVence: string;
	impuesto1: number;
	fovial: number;
	cotrans: number;
	impuesto2: number;
	moneda: string;
	monto: number;
	nombre: string;
	proveedor: string;
	saldo: number;
	selloRecibido: string;
	subtotal: number;
}
export interface IResponseCentroCuenta {
	CUENTA_CONTABLE: string;
	DESCRIPCION: string;
}

export interface IResquestConsultarArticulo {
	id: number;
	codArticulo: string;
	descripcion: string;
	clasificacion1Id: number;
	clasificacion2Id: number;
	clasificacion3Id: number;
	clasificacion4Id: number;
	clasificacion5Id: number;
	clasificacion6Id: number;
	factorConver1: number;
	factorConver2: number;
	factorConver3: number;
	factorConver4: number;
	factorConver5: number;
	factorConver6: number;
	tipo: string;
	tiendaEnLinea: boolean;
	ventaTarjetaCredito: boolean;
	pesoNeto: number;
	pesoBruto: number;
	volumen: number;
	bultos: number;
	categoriaArticuloId: number;
	factorEmpaque: number;
	factorVenta: number;
	existenciaMinima: number;
	existenciaMaxima: number;
	puntoDeOrden: number;
	costoLoc: number;
	costoDol: number;
	precioBaseLocal: number;
	precioBaseDol: number;
	ultimaSalida: string;
	ultimoMovimiento: string;
	ultimoIngreso: string;
	ultimoInventario: string;
	claseABC: string;
	frecuenciaConteo: number;
	codigoBarrasVent: string;
	codigoBarrasInvt: string;
	activo: boolean;
	usaLotes: boolean;
	obligaCuarentena: boolean;
	minVidaCompra: number;
	minVidaConsumo: number;
	minVidaVenta: number;
	vidaUtilPromedio: number;
	diasCuarentena: number;
	articuloDelProv: string;
	ordenMinima: number;
	plazoReabast: number;
	loteMultiplo: number;
	notas: string;
	usaNumerosSerie: boolean;
	//modalidadInvFis: string;
	//tipoCodBarraDet: string;
	//tipoCodBarraAlm: string;
	usaReglasLocales: boolean;
	unidadAlmacenId: number;
	unidadVentaId: number;
	perecedero: boolean;
	manufacturador: string;
	//codigoRetencion: string;
	//retencionVenta: string;
	//retencionCompra: string;
	//modeloRetencion: string;
	estilo: string;
	talla: string;
	color: string;
	tipoCosto: string;
	costoPromUltimoLoc: number;
	costoPromUltimoDol: number;
	esImpuesto: boolean;
	//tipoDocIVA: string;
	sugiereMin: boolean;
	calculaPercep: boolean;
	//porcPercep: number;
	impuestoId: number;
	unidadEmpaqueId: number;
	proveedorId: number;
	//urlimagen: string;
	usuarioCreacion: string;
	usuarioModificacion: string;
	fechaCreacion: Date;
	fechaModificacion: Date;
}
export interface IRequestCreateArticulo {
	codArticulo: string;
	descripcion: string;
	clasificacion1Id: number;
	clasificacion2Id: number;
	clasificacion3Id: number;
	clasificacion4Id: number;
	clasificacion5Id: number;
	clasificacion6Id: number;
	factorConver1: number;
	factorConver2: number;
	factorConver3: number;
	factorConver4: number;
	factorConver5: number;
	factorConver6: number;
	tipo: string;
	tiendaEnLinea: boolean;
	ventaTarjetaCredito: boolean;
	pesoNeto: number;
	pesoBruto: number;
	volumen: number;
	bultos: number;
	categoriaArticuloId: number;
	factorEmpaque: number;
	factorVenta: number;
	existenciaMinima: number;
	existenciaMaxima: number;
	puntoDeOrden: number;
	costoLoc: number;
	costoDol: number;
	precioBaseLocal: number;
	precioBaseDol: number;
	ultimaSalida: string;
	ultimoMovimiento: string;
	ultimoIngreso: string;
	ultimoInventario: string;
	claseABC: string;
	frecuenciaConteo: number;
	codigoBarrasVent: string;
	codigoBarrasInvt: string;
	activo: boolean;
	usaLotes: boolean;
	obligaCuarentena: boolean;
	minVidaCompra: number;
	minVidaConsumo: number;
	minVidaVenta: number;
	vidaUtilPromedio: number;
	diasCuarentena: number;
	articuloDelProv: string;
	ordenMinima: number;
	plazoReabast: number;
	loteMultiplo: number;
	notas: string;
	usaNumerosSerie: boolean;
	//modalidadInvFis: string;
	//tipoCodBarraDet: string;
	//tipoCodBarraAlm: string;
	usaReglasLocales: boolean;
	unidadAlmacenId: number;
	unidadVentaId: number;
	perecedero: boolean;
	manufacturador: string;
	//codigoRetencion: string;
	//retencionVenta: string;
	//retencionCompra: string;
	//modeloRetencion: string;
	estilo: string;
	talla: string;
	color: string;
	tipoCosto: string;
	costoPromUltimoLoc: number;
	costoPromUltimoDol: number;
	esImpuesto: boolean;
	//tipoDocIVA: string;
	sugiereMin: boolean;
	calculaPercep: boolean;
	//porcPercep: number;
	impuestoId: number;
	unidadEmpaqueId: number;
	proveedorId: number;
	//urlimagen: string;
	usuarioCreacion: string;
	usuarioModificacion: string;
	fechaCreacion: Date;
	fechaModificacion: Date;
}

export interface ITicketPdf {
	iva: number;
	cliente: string;
	vendedor: string;
	empresa: [
		{
			nombre: string;
			complementoDir: string;
			desActividad: string;
			nit: string;
			nrc: string;
			telefono: string;
			logoUrl: string;
		}
	];
	linea: [
		{
			bodega: string;
			cantidad: number;
			montoDescu: number;
			porDesc: number;
			nombre: string;
			precioUni: number;
			totalLinea: number;
			lote: string;
			fechaVence: string;
		}
	];
	resumen: [
		{
			totalNoSuj: number;
			totalExenta: number;
			totalGravada: number;
			subTotalVentas: number;
			totalDescu: number;
			subTotal: number;
			ivaPerci1: number;
			ivaRete1: number;
			reteRenta: number;
			montoTotalOperacion: number;
			totalPagar: number;
			totalLetras: number;
		}
	];
	documento: [
		{
			dte: string;
			fechaDocumento: string;
			fechaDocVence: string;
			condicionPago: string;
			diasNeto: number;
			formaPago: string;
		}
	];
	receptor: [
		{
			nit: string;
			nrc: string;
			nombre: string;
			descActividad: string;
			nombreComercial: string;
			direccion_compl: string;
			telefono: string;
			correo: string;
		}
	];
	dte: [
		{
			dte: string;
			codigoGeneracion: string;
			selloRecibido: string;
			fechaProce: string;
			tipoDoc: string;
			diasCredito?: string;
			condicionPago?: string;
			formaPago?: string;
			fechavence?: string;
		}
	];
}
