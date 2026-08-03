import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'tipoDetallado'
})
export class TipoDetalladoPipe implements PipeTransform {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
	transform(value: string, ...args: string[]): any {
		if (value == 'A') {
			return 'Activo';
		} else if (value == 'P') {
			return 'Pasivo';
		} else if (value == 'T') {
			return 'Patrimonio';
		} else if (value == 'G') {
			return 'Gasto';
		} else if (value == 'O') {
			return 'Orden';
		} else if (value == 'I') {
			return 'Ingreso';
		}
	}
}
