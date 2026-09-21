export interface IDevolucionFr {
	codigo: string;
	compania: string;
	ruta: string;
	cliente: string;
	bodega: string;
	documentoReferencia: string;
	estado: 'Nuevo' | 'Aprobado' | 'Sincronizado';
	anulada: boolean;
	cantidadLineas: number;
	fecha: string;
	lote: string;
}

export interface ILineaArticuloDevolucion {
	articulo: string;
	descripcion: string;
	cantidad: number;
	lote: string;
}
