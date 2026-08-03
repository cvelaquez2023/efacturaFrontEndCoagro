export interface IResponseCatCliente {
	id: number;
	descripcion: 'string';
}

export interface IRequestCreateCatCliente {
	codCategoria: string;
	descripcion: string;
	ctrCtaVentasExenId: number;
	ctrCtaVentasId: number;
	ctrCtaAjusteRedondeoId: number;
	ctrCtaAnticipoCCId: number;
	ctrCtaCCId: number;
	ctrCtaCobrComId: number;
	ctrCtaContadoId: number;
	ctrCtaCostLinId: number;
	ctrCtaCostVentId: number;
	ctrCtaCreditoCCId: number;
	ctrCtaDebitoCCId: number;
	ctrCtaDescBonifId: number;
	ctrCtaDescGralId: number;
	ctrCtaDescLinId: number;
	ctrCtaDevVentasId: number;
	ctrCtaImpuesto1CCId: number;
	ctrCtaImpuesto2CCId: number;
	ctrCtaIntCorrId: number;
	ctrCtaIntMoraCCId: number;
	ctrCtaLCId: number;
	ctrCtaProntoPagoCCId: number;
	ctrCtaRecibosCCId: number;
	ctrCtaRubro1CCId: number;
	ctrCtaRubro2CCId: number;
	ctrCtaVendComId: number;
}
