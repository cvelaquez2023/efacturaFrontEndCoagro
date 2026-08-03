export interface IResponseCtaProveedor {
	codCategoria: string;
	descripcion: string;
	ctrCtaAjusteRedondeoId: number;
	ctrCtaAnticipoId: number;
	ctrCtaCpId: number;
	ctrCtaCreditoCPId: number;
	ctrCtaImpuesto1CpId: number;
	ctrCtaImpuesto2CpId: number;
	ctrCtaLPId: number;
	ctrCtaProntoPagoCpId: number;
	ctrCtaRubro1CpId: number;
	ctrCtaRubro2CpId: number;
	ctrCtaDebitoCpId: number;
	ctrCtaComisionesCpId: number;
}

export interface IRequestCreateCtaProveedor {
	codCategoria: string;
	descripcion: string;
	ctrCtaAjusteRedondeoId: number;
	ctrCtaAnticipoId: number;
	ctrCtaCPId: number;
	ctrCtaCreditoCPId: number;
	ctrCtaImpuesto1CpId: number;
	ctrCtaImpuesto2CpId: number;
	ctrCtaLPId: number;
	ctrCtaProntoPagoCpId: number;
	ctrCtaRubro1CpId: number;
	ctrCtaRubro2CpId: number;
	ctrCtaDebitoCpId: number;
	ctrCtaComisionesCpId: number;
}
