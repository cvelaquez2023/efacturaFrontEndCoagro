export interface IRequestCreateCuentaContable {
	codCuentaContable: string;
	seccionCuenta: string;
	descripcion: string;
	tipo: string;
	tipoDetallado: string;
	saldoNormal: string;
	conversion: string;
	tipoCambio: string;
	aceptaDatos: boolean;
	usaCentroCosto: boolean;
	notas: string;
	usoRestringido: boolean;
	origenConversion: string;
}

export interface IResponseCuentaContable {
	codCuentaContable: string;
	seccionCuenta: string;
	descripcion: string;
	tipo: string;
	tipoDetallado: string;
	saldoNormal: string;
	conversion: string;
	tipoCambio: string;
	aceptaDatos: boolean;
	usaCentroCosto: boolean;
	notas: string;
	usoRestringido: boolean;
	origenConversion: string;
	IsDeleted: boolean;
	createdby: string;
	createDate: string;
	updatedby: string;
	updateDate: string;
}
