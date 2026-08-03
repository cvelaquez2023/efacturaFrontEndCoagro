import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'estado'
})
export class EstadoPipe implements PipeTransform {
	transform(value: boolean, ...args: unknown[]): any {
		if (value) {
			return 'Abierto';
		} else {
			return 'Cerrado';
		}
	}
}
