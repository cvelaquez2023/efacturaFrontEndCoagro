import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'cuentaTipo'
})
export class CuentaTipoPipe implements PipeTransform {
	transform(value: unknown, ...args: unknown[]): unknown {
		return null;
	}
}
