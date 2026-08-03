export interface IConsultaPaqueteInvApiModel {
	id: number;
	codPaqueteInv: string;
	descripcion: string;
	usuarioCreador: string;
}

export interface ICreatePaqueteInv {
	codPaqueteInv: string;
	descripcion: string;
	ultimoUsuario: string;
	usuarioCreador: string;
	fechaUltAcceso: string;
}

export interface ICreateMovInventario {
	consecutivoId: number;
	usuario: string;
	fechaHora: string;
	moduloOrigen: string;
	referencia: string;
	asiento: string;
	usuarioAprob: string;
	fechaHoraAprob: string;
	paqueteInventario: number;
	detalle: [
		{
			movInventarioEncId: number;
			consecutivo: number;
			fechaHoraTransac: string;
			docTributarioId: number;
			ajusteConfigId: number;
			articuloId: number;
			bodegaId: number;
			bodegaDestinoId: number;
			localizacionId: number;
			locDestinoId: number;
			loteId: number;
			tipo: string;
			subtipo: string;
			subsubtipo: string;
			naturaleza: string;
			cantidad: number;
			costoTotLoc: number;
			costoTotDol: number;
			precioTotalLocal: number;
			precioTotalDolar: number;
			contabilizada: boolean;
			fecha: string;
			centroCuentaId: number;
			unidadDistribucionId: number;
			asientoCardex: string;
			docFiscal: string;
			tipoOperacionId: number;
			tipoPagoId: number;
		}
	];
}
