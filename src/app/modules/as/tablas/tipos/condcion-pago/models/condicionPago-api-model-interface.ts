export interface ICondicionPagoCreate {
	codCondicionPago: string;
	descripcion: string;
	diasNeto: number;
	pagosParciales: boolean;
	descuentoContado: number;
	tipoCondPago: string;
	plazoCondPago: number;
	activa: boolean;
}
export interface ICondicionPagoConsulta {
	id: number;
	isDeleted: boolean;
	createdby: string;
	createDate: string;
	updatedby: string;
	updateDate: string;
	codCondicionPago: string;
	descripcion: string;
	diasNeto: number;
	pagosParciales: boolean;
	descuentoContado: number;
	tipoCondPago: string;
	plazoCondPago: number;
	activa: boolean;
}
export interface ICondicionPagoEdit {
	codCondicionPago: string;
	descripcion: string;
	diasNeto: number;
	pagosParciales: boolean;
	descuentoContado: number;
	tipoCondPago: string;
	plazoCondPago: number;
	activa: boolean;
}
