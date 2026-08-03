export interface IResponseExistenciaLote {
	id: number;
	cantDisponible: number;
	cantReservada: number;
	cantNoAprobada: number;
	cantVencida: number;
	cantRemitida: number;
	costoUntLoc: number;
	costoUntDol: number;
	bodega: { id: number; codbodega: string; nombre: string };
	articulo: { id: number; codarticulo: string; descripcion: string };
	localizacion: { id: number; codlocalizacion: string; descipcion: string };
	lote: { id: number; codLote: string; estado: string };
}
