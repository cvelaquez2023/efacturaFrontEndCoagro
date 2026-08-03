/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Directive, HostListener, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
	selector: '[appKzMaskCurrency]',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: KzMaskCurrencyDirective,
			multi: true
		}
	]
})
export class KzMaskCurrencyDirective implements ControlValueAccessor, OnInit {
	onTouched: any;
	onChange: any;
	separadorDecimal!: string;
	separadorMilhar!: string;
	prefixo!: string;
	@Input('appKzMaskCurrency') KzMask: any;
	ngOnInit(): void {
		this.separadorDecimal = this.KzMask.decimal || '.';
		this.separadorMilhar = this.KzMask.milhar || ',';
		this.prefixo = this.KzMask.prefixo || '';
	}
	writeValue(obj: any): void {
		console.log(obj);
	}
	registerOnChange(fn: any): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}
	@HostListener('keyup', ['$event'])
	onKeyup($event: any) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		const valorNum = parseInt($event.target.value.replace(/\D/g, ''));
		let valorMask = '';
		let valor: string;
		if (isNaN(valorNum)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			this.onChange('');
			$event.target.valur = '';
			return;
		}
		valor = valorNum.toString();
		switch (valor.length) {
			case 1:
				valorMask = '0' + this.separadorDecimal + '0' + valor;
				break;
			case 2:
				valorMask = '0' + this.separadorDecimal + valor;
				break;
			case 3:
				valorMask = valor.substring(0, 1) + this.separadorDecimal + valor.substring(1, 2);
				break;
			default:
				break;
		}
		if (valorMask === '') {
			let sepMilhar = 0;
			for (let i = valor.length - 3; i >= 0; i--) {
				if (sepMilhar === 3) {
					valorMask = this.separadorMilhar + valorMask;
					sepMilhar = 0;
				}
				valorMask = valor.charAt(i) + valorMask;
				sepMilhar++;
			}
			valorMask = valorMask + this.separadorDecimal + valor.substring(valor.length - 2, 2);
		}
		if (this.separadorDecimal === ',') {
			this.onChange(valorMask.replace(/\./g, ''.replace(',', '0')));
		} else {
			this.onChange(valorMask.replace(/\,/g, ''));
		}
		if (this.prefixo !== '') {
			valorMask = this.prefixo + '' + valorMask;
		}
		$event.target.value = valorMask;
	}
	@HostListener('blur', ['$event'])
	onBlur($event: any) {
		let pattern = '0' + this.separadorDecimal + '00';
		if ($event.target.value.indexOf(pattern) === -1) {
			return;
		}
		this.onChange('');
		$event.target.value = '';
	}
}
