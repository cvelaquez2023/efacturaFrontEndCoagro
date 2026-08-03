export interface IResponseZona {
	codZona: string;
	descripcion: string;
	activo: boolean;
	id: number;
	isDelete: boolean;
}

export interface IRequestCreateZona {
	codZona: string;
	descripcion: string;
	activa: boolean;
}
export interface IHomeZona {
	id: number;
	codZona: string;
	description: string;
	activo: boolean;
}
