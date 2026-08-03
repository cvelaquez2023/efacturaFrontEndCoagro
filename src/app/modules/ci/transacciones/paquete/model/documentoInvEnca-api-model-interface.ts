export interface ICrearDocumnetoInvEnca {
	documentoInv: string;
	referencia: string;
	fechaDocumento: string;
	consecutivoId: number;
	paqueteInventarioId: number;
	usuario: string;
	mensajeSistema: string;
}
export interface IConsultaDocumnetoInvEnca {
	id: number;
	paqueteInventarioId: number;
	documentoInv: string;
	referencia: string;
	fechaHoraCreacion: string;
	fechaDocumento: string;
	selecionado: boolean;
	usuario: string;
	mensajeSistema: string;
	usuarioApro: string;
	fechaHoraAprob: string;
	aprobado: boolean;
	consecutivoId: number;
	consecutivoInv: {
		codConsecutivo: string;
	};
}
