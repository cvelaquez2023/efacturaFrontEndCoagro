export interface IConsultarExistenciaBodega {
	id: number;
	existenciaMinima: number;
	existenciaMaxima: number;
	puntoDeOrden: number;
	cantDisponible: number;
	cantReservada: number;
	cantNoAprobada: number;
	cantVencida: number;
	cantTransito: number;
	cantProduccion: number;
	cantPedida: number;
	cantRemitida: number;
	congelado: true;
	fechaCong: string;
	bloqueaTrans: boolean;
	fechaDescong: string;
	costoUntPromedioLoc: number;
	costoUntPromedioDol: number;
	articulo: { id: number; descripcion: string };
	bodega: { id: number; descripcion: string; activa: boolean };
}
