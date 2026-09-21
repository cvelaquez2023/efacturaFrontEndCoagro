export interface IResponseArticuloErp {
	ARTICULO: string;
	DESCRIPCION: string;
}

export interface IPaginacionArticuloErp {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface IResponsePaginadaArticuloErp<T> {
	success: boolean;
	errors: string[];
	result: T;
	pagination: IPaginacionArticuloErp;
}
