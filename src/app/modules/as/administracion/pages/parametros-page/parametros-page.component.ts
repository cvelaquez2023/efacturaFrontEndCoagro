import { IConsultaPais } from './../../../tablas/areas/pais/service/pais-api-model-interface';
import { TipoCambioApiService } from '../../../tablas/tipos/tipo-de-cambio/service/tipo-cambio-api.service';
import { PaisApiService } from './../../../tablas/areas/pais/service/pais-api.service';
import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { IConsultaTipoCambio } from '@app/modules/as/tablas/tipos/tipo-de-cambio/service/tipo-cambio-api-model-interface';
interface Pais {
	value: string;
	viewValue: string;
}

@Component({
	selector: 'app-parametros-page',
	templateUrl: './parametros-page.component.html',
	styleUrls: ['./parametros-page.component.scss']
})
export class ParametrosPageComponent implements OnInit {
	constructor(private _paisApiService: PaisApiService, private _tipoCambioApiService: TipoCambioApiService) {}

	listPais: IConsultaPais[] = [];
	listTipoCambio: IConsultaTipoCambio[] = [];
	ngOnInit(): void {
		this._loadHome(1, 100000);
	}

	private _loadHome(page: number, rows: number): void {
		//cargamos pais
		this._paisApiService.getPaises(page, rows).subscribe((response) => {
			this.listPais = response.result;
		});
		//Cargamos Tipo Cambio
		this._tipoCambioApiService.getTipoCambio(page, rows).subscribe((response) => {
			this.listTipoCambio = response.result;
		});
	}

	pais: Pais[] = [
		{ value: 'steak-0', viewValue: 'Steak' },
		{ value: 'pizza-1', viewValue: 'Pizza' },
		{ value: 'tacos-2', viewValue: 'Tacos' }
	];
	hideRequiredControl = new FormControl(false);
}
