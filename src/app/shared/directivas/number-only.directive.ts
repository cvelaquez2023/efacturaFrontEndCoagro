/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
	// eslint-disable-next-line @angular-eslint/directive-selector
	selector: 'input[numberOnly]'
})
export class NumberOnlyDirective {
	constructor(private readonly elRef: ElementRef) {}
	@HostListener('input', ['$event'])
	onChangeInput(event: Event): void {
		console.log(this.elRef.nativeElement.value);
		// eslint-disable-next-line no-useless-escape
		const numbersOnly = /[^0-9]*/g;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const initValue = this.elRef.nativeElement.value;
		console.log(initValue);
		this.elRef.nativeElement.value = initValue.replace(numbersOnly, '');
		if (initValue !== this.elRef.nativeElement.value) {
			event.stopPropagation();
		}
	}
}
