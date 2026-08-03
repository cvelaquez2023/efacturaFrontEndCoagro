export interface IResponseLote {
	codLote: string;
	loteProveedor: string;
	fechaEntrada: string;
	fechaVencimiento: string;
	fechaCuarentena: string;
	cantidadIngresada: number;
	estado: string;
	tipoIngreso: string;
	notas: string;
	ultimoIngreso: number;
	fechaFabricacion: string;
	proveedorId: number;
	articuloId: number;
	articulo: {
		codArticulo: string;
		descripcion: string;
		perecedero: boolean;
	};
	proveedor: {
		nombre: string;
	};
}
