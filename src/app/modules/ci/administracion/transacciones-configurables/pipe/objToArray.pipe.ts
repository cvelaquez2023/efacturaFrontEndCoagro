/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'ObjToArray'
})
export class ObjToArrayPipe implements PipeTransform {
	// eslint-disable-next-line no-empty-pattern
	transform(value: any, []): any {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		return Object.values(value);
	}
}
