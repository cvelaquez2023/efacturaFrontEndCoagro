export interface IResponseVendedor {
	codVendedor: string;
	nombre: string;
	email: string;
	activo: boolean;
	id: number;
	isDelete: boolean;
}

export interface IRequestCreateVendedor {
	codVendedor: string;
	nombre: string;
	email: string;
	activo: boolean;
}
export interface IResponseProveedor {
	PROVEEDOR: string;
	CONTRIBUYENTE: string;
	NOMBRE: string;
	DIRECCION: string;
	DIVISION_GEOGRAFICA1: string;
	DIVISION_GEOGRAFICA2: string;
	TELEFONO1: string;
	E_MAIL: string;
}
