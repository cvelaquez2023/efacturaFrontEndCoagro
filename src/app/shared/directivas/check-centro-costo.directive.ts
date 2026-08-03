/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
	// eslint-disable-next-line @angular-eslint/directive-selector
	selector: 'input[checkCentroCosto]'
})
export class CheckCentroCostoDirective {
	constructor(private eRef: ElementRef) {}

	@HostListener('input', ['$event'])
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onChangeInput(event: Event): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const centroCostoOnly = /[^9,-.]*/g;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const initValue = this.eRef.nativeElement.value;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
		this.eRef.nativeElement.value = initValue.replace(centroCostoOnly, '');
		if (initValue !== this.eRef.nativeElement.value) {
			event.stopPropagation();
		}
	}
}
