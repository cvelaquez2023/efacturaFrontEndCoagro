export interface ICreateCategoriaArticulo {
	codCategoriaArticulo: string;
	descripcion: string;
	//Generales
	ctrCtaInventarioId: number;
	ctrCtaVariaCostoId: number;
	ctrCtaFaltInventFisId: number;
	ctrCtaSobrInventFisId: number;
	ctrCtaVencimientoId: number;
	ctrCtaAjuId: number;
	ctrCtaAjuCMVId: number;
	//Local
	//Exterior
	//Consumo
	//Remisiones

	ctrCtaCompraImpId: number;
	ctrCtaCompraLocId: number;
	ctrCtaComsCobroExpId: number;
	ctrCtaComsCobroLocId: number;
	ctrCtaComsVentaExpId: number;
	ctrCtaComsVentaLocId: number;
	ctrCtaConsDesperdicId: number;
	ctrCtaConsGastoId: number;
	ctrCtaConsNormalId: number;
	ctrCtaConsRetrabajoId: number;
	ctrCtaCostDescExpId: number;
	ctrCtaCostDescLocId: number;
	ctrCtaCostVentaExpId: number;
	ctrCtaCostVentaLocId: number;
	ctrCtaDescBonifExpId: number;
	ctrCtaDescBonifLocId: number;
	ctrCtaDescLineaExpId: number;
	ctrCtaDescLineaLocId: number;
	ctrCtaDescVentaExpId: number;
	ctrCtaDescVentaLocId: number;
	ctrCtaDevVentasExpId: number;
	ctrCtaDevVentasLocId: number;

	ctrCtaFaltanteRemisId: number;
	//CtrCtaIngDevolucId: number;
	//CtrCtaInvRemitidoId: number;

	ctrCtaMatAplicadosId: number;
	ctrCtaMatProcesoId: number;
	//CtrCtaPerdDevolucId: number;
	CtrCtaRetAsumId: number;

	ctrCtaSobranteRemisId: number;

	ctrCtaVentasExenExpId: number;
	ctrCtaVentasExenLocId: number;
	ctrCtaVentasExpId: number;
	ctrCtaVentasLocId: number;
}
export interface IResponseCategoriaArticulo {
	id: number;
	CodCategoriaArticulo: string;
	Descripcion: string;
	CtrCtaAjuCMVId: number;
	CtrCtaAjuId: number;
	CtrCtaCPGarId: number;
	CtrCtaCompraImpId: number;
	CtrCtaCompraLocId: number;
	CtrCtaComsCobroExpId: number;
	CtrCtaComsCobroLocId: number;
	CtrCtaComsVentaExpId: number;
	CtrCtaComsVentaLocId: number;
	CtrCtaConsDesperdicId: number;
	CtrCtaConsGastoId: number;
	CtrCtaConsNormalId: number;
	CtrCtaConsRetrabajoId: number;
	CtrCtaCostDescExpId: number;
	CtrCtaCostDescLocId: number;
	CtrCtaCostVentaExpId: number;
	CtrCtaCostVentaLocId: number;
	CtrCtaDescBonifExpId: number;
	CtrCtaDescBonifLocId: number;
	CtrCtaDescLineaExpId: number;
	CtrCtaDescLineaLocId: number;
	CtrCtaDescVentaExpId: number;
	CtrCtaDescVentaLocId: number;
	CtrCtaDevVentasExpId: number;
	CtrCtaDevVentasLocId: number;
	CtrCtaFaltInventFisId: number;
	CtrCtaFaltanteRemisId: number;
	CtrCtaIngDevolucId: number;
	CtrCtaInvRemitidoId: number;
	CtrCtaInventarioId: number;
	CtrCtaMatAplicadosId: number;
	CtrCtaMatProcesoId: number;
	CtrCtaPerdDevolucId: number;
	CtrCtaPuGarId: number;
	CtrCtaRetAsumId: number;
	CtrCtaSobrInventFisId: number;
	CtrCtaSobranteRemisId: number;
	CtrCtaVariaCostoId: number;
	CtrCtaVencimientoId: number;
	CtrCtaVentasExenExpId: number;
	CtrCtaVentasExenLocId: number;
	CtrCtaVentasExpId: number;
	CtrCtaVentasLocId: number;
}
