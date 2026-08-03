/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
	selector: '[appDecimal]'
})
export class DecimalDirective {
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	private regex: RegExp = new RegExp(/^\d*\.?\d{0,3}$/g);
	private specialKeys: Array<string> = [
		'Backspace',
		'Tab',
		'End',
		'Home',
		'-',
		'ArrowLeft',
		'ArrowRight',
		'Del',
		'Delete'
	];
	constructor(private el: ElementRef) {}
	@HostListener('keydown', ['$event'])
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	onKeyDown(event: KeyboardEvent) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		console.log(this.el.nativeElement.value);
		if (this.specialKeys.indexOf(event.key) !== -1) {
			return;
		}
		const current: string = this.el.nativeElement.value;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const position = this.el.nativeElement.selectionStart;
		const next: string = [
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			current.slice(0, position),
			event.key == 'Decimal' ? '.' : event.key,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			current.slice(position)
		].join('');
		if (next && !String(next).match(this.regex)) {
			event.preventDefault();
		}
	}
}
