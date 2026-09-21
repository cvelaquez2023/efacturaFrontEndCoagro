import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

/** Traduce las etiquetas de mat-paginator ("Page 1 of 1", "Items per page", etc.) al español,
 *  incluyendo el formato "Página X de Y" en el rango, para todos los mat-paginator de la app. */
@Injectable()
export class SpanishPaginatorIntl extends MatPaginatorIntl {
	override itemsPerPageLabel = 'Registros por página:';
	override nextPageLabel = 'Página siguiente';
	override previousPageLabel = 'Página anterior';
	override firstPageLabel = 'Primera página';
	override lastPageLabel = 'Última página';

	override getRangeLabel = (page: number, pageSize: number, length: number): string => {
		if (length === 0 || pageSize === 0) {
			return 'Página 1 de 1 (0 registros)';
		}
		const totalPaginas = Math.max(Math.ceil(length / pageSize), 1);
		const inicio = page * pageSize + 1;
		const fin = Math.min((page + 1) * pageSize, length);
		return `Página ${page + 1} de ${totalPaginas} (${inicio}–${fin} de ${length})`;
	};
}
