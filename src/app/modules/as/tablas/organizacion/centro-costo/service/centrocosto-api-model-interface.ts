export interface IResponseCentroCosto {
	codCentroCosto: string;
	descripcion: string;
	aceptadatos: boolean;
	tipo: string;
	id: number;
	isDelete: boolean;
}

export interface IRequestCentroCosto {
	codCentroCosto: string;
	descripcion: string;
	aceptadatos: boolean;
	tipo: string;
}
