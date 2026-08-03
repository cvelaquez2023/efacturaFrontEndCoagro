export interface IResponseClasificacion {
	id: number;
	codClasificacion: string;
	descripcion: string;
	agrupacion: string;
	usaNumeroSerire: boolean;
	plantillaSerie: string;
	aporteCodigo: string;
	tipoCodigobarra: string;
	unidadMedidadId: number;
}

export interface ICreateClasificacion {
	codClasificacion: string;
	descripcion: string;
	agrupacion: string;
	usaNumeroSerire: boolean;
	plantillaSerie: string;
	aporteCodigo: string;
	tipoCodigobarra: string;
	unidadMedidadId: number;
}
