import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'contabilidad'
})
export class ContabilidadPipe implements PipeTransform {
	transform(value: string, ...args: string[]): any {
		if (value === 'F') {
			return 'Fiscal';
		} else if (value === 'C') {
			return 'Corporativa';
		}
	}
}
