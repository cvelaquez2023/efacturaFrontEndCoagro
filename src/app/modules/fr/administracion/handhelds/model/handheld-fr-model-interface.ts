export interface ICreateHandheldModel {
	handheld: string;
	descripcion: string;
	serie?: string;
	modelo?: string;
	estado: string;
	firma?: string;
}
export interface IResponseHandheld {
	HANDHELD: string;
	DESCRIPCION: string;
	SERIE: string;
	MODELO: string;
	ESTADO: string;
	FIRMA: string;
}
