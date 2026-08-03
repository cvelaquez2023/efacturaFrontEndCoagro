export interface IResponsePais {
	codPais: string;
	nombre: string;
	activo: boolean;
	id: number;
	isDelete: boolean;
}
export interface IConsultaPais {
	id: number;
	codPais: string;
	nombre: string;
}

export interface ICrearPais {
	codPais: string;
	nombre: string;
	//Tab Facturacion
	ctrCtaVentasId: number;
	ctrCtaVentasExentaId: number;
	ctrCtaDevSobreVta: number;
	ctrCtaDescuentaGral: number;
	ctrCtaCostoVentas: number;
	ctrCtaDescuentoLinea: number;
	ctrCtaCostoLineas: number;
	ctrCtaPagoContado: number;
	ctrCtaGastoComision: number;
	ctrCtaDescBonificacion: number;
	ctrCtaAjustesRedondeo: number;
	//Tab CC
	ctrCtaCuentasXCobrar: number;
	ctrCtaLetraxCobrar: number;
	ctrCtaProntoPago: number;
	ctrCtaInteresesdeMora: number;
	ctrCtaRecibos: number;
	ctrCtaImpuesto1: number;
	ctrCtaImpuesto2: number;
	ctrCtaAnticipos: number;
	ctrCtaCierreDebitos: number;
	ctrCtaCierreCreditos: number;
	ctrCtaInteresCorriente: number;
	//Tab CP
	ctrCtaCuentasXPagar: number;
	ctrCtaLetraxPagar: number;
	ctrCtaProntoPagoCP: number;
	ctrCtaComisiones: number;
	ctrCtaImpuesto1CP: number;
	ctrCtaImpuesto2CP: number;
	ctrCtaAnticiposCP: number;
	ctrCtaCierreDebitosCP: number;
	ctrCtaCierreCreditosCP: number;
	//Tab Otros
	Rubro1CC: number;
	Rubro2CC: number;
	Rubro1CP: number;
	Rubro2CP: number;
	codigoISO: string;
}
