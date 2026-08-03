/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'tipoDoc'
})
export class TipoDocPipe implements PipeTransform {
	transform(value: string, ...args: string[]): string {
		const tipo = args[0];
		let valor = '';
		switch (value) {
			case '01':
				valor = 'FA';
				break;
			case '03':
				valor = 'CF';
				break;
			case '04':
				valor = 'NR';
				break;
			case '05':
				valor = 'NC';
				break;
			case '06':
				valor = 'ND';
				break;
			case '07':
				valor = 'CR';
				break;
			case '08':
				valor = 'CL';
				break;
			case '11':
				valor = 'FE';
				break;
			case '14':
				valor = 'FSE';
				break;
			case '15':
				valor = 'CD';
				break;
			default:
				break;
		}
		return valor;
	}
}
