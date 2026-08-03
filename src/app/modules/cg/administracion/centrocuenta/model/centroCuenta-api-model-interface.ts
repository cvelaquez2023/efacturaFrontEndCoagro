export interface IResponseCentroCuenta {
	id: number;
	centroCosto: {
		codCentroCosto: string;
		descripcion: string;
	};
	cuentaContable: {
		codCuentaContable: string;
		descripcion: string;
	};
}

export interface IRequestCreateCentroCuenta {
	id: number;
}
