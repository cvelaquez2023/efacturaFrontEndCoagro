/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Directive, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
	selector: '[appKzMask]',
	providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: KzMaskDirective, multi: true }]
})
export class KzMaskDirective implements ControlValueAccessor {
	onTouched: any;
	onChange: any;
	@Input('appKzMask') appKsMask!: string;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	writeValue(obj: any): void {
		console.log('demo');
	}
	registerOnChange(fn: any): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	@HostListener('keyup', ['$event'])
	onKeyup($event: any) {
		console.log('keyup', $event);
		// eslint-disable-next-line no-var
		var valor = $event.target.value.replace(/\D/g, '');
		// eslint-disable-next-line no-var
		var pad = this.appKsMask.replace(/\D/g, '').replace(/9/g, '_');
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		// eslint-disable-next-line no-var
		var valorMask = valor + pad.substring(0, pad.length - valor.length);
		//Retorna caso presion backspace
		if ($event.keyCode === 8) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			this.onChange(valor);
			return;
		}
		if (valor.length <= pad.length) {
			this.onChange(valor);
		}
		let valorMaskPos = 0;
		valor = '';
		for (let i = 0; i < this.appKsMask.length; i++) {
			if (isNaN(parseInt(this.appKsMask.charAt(i)))) {
				valor += this.appKsMask.charAt(i);
			} else {
				valor += valorMask[valorMaskPos++];
			}
		}
		if (valor.indexOf('_') > -1) {
			valor = valor.substr(0, valor.indexOf('_'));
		}
		$event.target.value = valor;
	}
	@HostListener('blur', ['$event'])
	onBlur($event: any) {
		console.log('Blur', $event);
		if ($event.target.value.length === this.appKsMask.length) {
			return;
		}
		this.onChange('');
		$event.target.value = '';
	}
}
