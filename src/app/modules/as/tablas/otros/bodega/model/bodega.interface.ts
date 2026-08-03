export interface IResponseBodega {
	codBodega: string;
	nombre: string;
	tipo: string;
	activo: boolean;
	telefono: string;
	direccion: string;
	SucursalId: number;
	id: number;
	isDelete: boolean;
}
export interface IResponseCreateBodega {
	codBodega: string;
	nombre: string;
	tipo: string;
	activa: boolean;
	telefono: string;
	direccion: string;
}
export interface IResponseLocaizacionBodega {
	id: number;
	isDeleted: boolean;
	createdby: string;
	createDate: string;
	updatedby: string;
	updateDate: string;
	bodegaId: number;
	bodega: {
		id: number;
		isDeleted: boolean;
		createdby: string;
		createDate: string;
		updatedby: string;
		updateDate: string;
		codBodega: string;
		nombre: string;
		tipo: string;
		activa: boolean;
		telefono: string;
		direccion: string;
	};
	codLocalizacion: string;
	descripcion: string;
	volumen: number;
	pesoMaximo: number;
	activa: boolean;
}
