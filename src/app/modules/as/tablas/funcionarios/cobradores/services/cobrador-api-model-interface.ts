export interface IResponseCobrador {
	codCobrador: string;
	nombre: string;
	email: string;
	activo: boolean;
	id: number;
	isDelete: boolean;
}

export interface IRequestCreateCobrador {
	codCobrador: string;
	nombre: string;
	email: string;
	activo: boolean;
}
