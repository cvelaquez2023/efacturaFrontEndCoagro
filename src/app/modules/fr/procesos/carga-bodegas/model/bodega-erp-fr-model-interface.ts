export interface IResponseBodegaErp {
	BODEGA: string;
	NOMBRE: string;
}

export interface IPaginacionBodegaErp {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface IResponsePaginadaBodegaErp<T> {
	success: boolean;
	errors: string[];
	result: T;
	pagination: IPaginacionBodegaErp;
}
