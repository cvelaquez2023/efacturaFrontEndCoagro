export interface IResponse<T = void> {
	success: boolean;
	errors: string[];
	result: T;
}

export interface IPaginacion {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}
export interface IResponsePaginada<T> extends IResponse<T> {
	pagination: IPaginacion;
}
