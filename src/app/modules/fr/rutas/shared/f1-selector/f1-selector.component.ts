import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

export interface IF1Item {
	codigo: string;
	nombre: string;
	[extra: string]: unknown;
}

export interface IF1SelectorData {
	titulo: string;
	items: IF1Item[];
	columnaCodigo?: string;
	columnaNombre?: string;
}

/**
 * Selector estilo "F1" del manual de Softland: los campos que lo usan no se digitan libremente,
 * se eligen de una lista ya existente (compañías, NCF, resoluciones, agentes, bodegas, etc.).
 */
@Component({
	selector: 'app-f1-selector',
	templateUrl: './f1-selector.component.html',
	styleUrls: ['./f1-selector.component.scss']
})
export class F1SelectorComponent {
	displayedColumns = ['codigo', 'nombre'];
	dataSource = new MatTableDataSource<IF1Item>();

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: IF1SelectorData,
		private _dialogRef: MatDialogRef<F1SelectorComponent>
	) {
		this.dataSource.data = data.items;
	}

	applyFilter(event: Event): void {
		const value = (event.target as HTMLInputElement).value;
		this.dataSource.filter = value.trim().toLowerCase();
	}

	seleccionar(item: IF1Item): void {
		this._dialogRef.close(item);
	}
}
