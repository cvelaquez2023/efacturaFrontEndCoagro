import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'cuentaTipo'
})
export class CuentaTipoPipe implements PipeTransform {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
	transform(value: string, ...args: string[]): any {
		if (value == 'B') {
			return 'Balance Situación';
		} else if (value == 'E') {
			return 'Estado de Resultados';
		} else if (value == 'O') {
			return 'Cuentas de Orden';
		}
	}
}
