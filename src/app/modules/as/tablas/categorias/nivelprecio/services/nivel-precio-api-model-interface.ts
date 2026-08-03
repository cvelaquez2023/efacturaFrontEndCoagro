export interface IResponseNivelPrecio {
	id: number;
	codNivelPrecio: string;
	esquemaTrabajo: string;
	sugerirDescuento: boolean;
	condicionPagoId: number;
	condicionPago: { id: number; codCondicionPago: string; descripcion: string };
	moneda: string;
}

export interface IRequestCreateNivelPrecio {
	codNivelprecio: string;
	esquemaTrabajo: string;
	sugerirDescuento: boolean;
	condicionPagoId: number;
	moneda: string;
}
