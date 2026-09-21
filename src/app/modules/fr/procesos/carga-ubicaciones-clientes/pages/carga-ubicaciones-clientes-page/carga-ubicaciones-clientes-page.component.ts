import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';

// Pantalla solo visual: no esta documentada explicitamente en el manual FRd, se infiere
// como proceso analogo a Carga de Clientes/Articulos para las coordenadas GPS de clientes.
// No existe endpoint real; el boton Procesar solo simula el resultado.
@Component({
	selector: 'app-carga-ubicaciones-clientes-page',
	templateUrl: './carga-ubicaciones-clientes-page.component.html',
	styleUrls: ['./carga-ubicaciones-clientes-page.component.scss']
})
export class CargaUbicacionesClientesPageComponent {
	constructor(
		private _formBuilder: FormBuilder,
		private _snotifyService: SnotifyService
	) {
		this.procesoForm = this._formBuilder.group({
			compania: ['COAGRO2', [Validators.required]],
			ruta: ['']
		});
	}

	procesoForm: FormGroup;
	procesoFinalizado = false;
	clientesActualizados = 0;

	procesar(): void {
		if (this.procesoForm.invalid) {
			return;
		}
		this.procesoFinalizado = true;
		this.clientesActualizados = 12;
		this._snotifyService.info('La carga de ubicaciones de clientes ha finalizado correctamente', { position: SnotifyPosition.rightTop });
	}
}
