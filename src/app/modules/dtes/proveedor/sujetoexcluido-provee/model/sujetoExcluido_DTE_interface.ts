export interface IResponseConsecutivo {
	CONSECUTIVO: string;
	ULTIMO_VALOR: string;
}
export interface IResponseDte14MH {
	selloRecibido: string;
}
export interface IResponseDTE14 {
	correo: string;
	tipoDocumento: string;
	numDocumento: string;
	nombre: string;
	telefono: string;
	direccion: {
		departamento: string;
		municipio: string;
		complemento: string;
	};
	aplicacion: {
		descripcion: string;
		monto: number;
		renta: number;
		total: number;
		fecha: string;
		dte: string;
	};
	hacienda: string;
	origen: string;
}
