/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'docEstado'
})
export class EstadoPipe implements PipeTransform {
	transform(value: boolean, ...args: string[]): string {
		const tipos = args[0];
		console.log('vemos el valor', value);
		let valor = '';
		if (value) {
			valor = 'Procesado';
		} else {
			valor = 'Pendiente';
		}
		return valor;
	}
}
