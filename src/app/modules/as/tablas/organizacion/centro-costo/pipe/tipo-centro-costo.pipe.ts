/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'tipoCentroCosto'
})
export class TipoCentroCostoPipe implements PipeTransform {
	transform(value: string, ...args: string[]): any {
		if (value == 'G') {
			return 'Gasto';
		} else if (value == 'A') {
			return 'Ambos';
		} else {
			return 'Ingresos';
		}
	}
}
