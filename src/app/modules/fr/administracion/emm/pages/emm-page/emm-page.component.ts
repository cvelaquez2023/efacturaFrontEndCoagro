import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';

// Pantalla solo visual (manual pag. 136): configuracion de la fuente de datos del EMM.
// No existe endpoint real; el boton Grabar solo simula el resultado.
@Component({
	selector: 'app-emm-page',
	templateUrl: './emm-page.component.html',
	styleUrls: ['./emm-page.component.scss']
})
export class EmmPageComponent implements OnInit {
	constructor(
		private _formBuilder: FormBuilder,
		private _snotifyService: SnotifyService
	) {}

	emmForm!: FormGroup;

	ngOnInit(): void {
		this.emmForm = this._formBuilder.group({
			compania: ['ERPADMIN', [Validators.required]],
			tipoServidor: ['SQLServer', [Validators.required]],
			servidor: ['', [Validators.required]],
			proveedor: ['SQLServer', [Validators.required]],
			usuario: ['', [Validators.required]],
			password: ['', [Validators.required]]
		});
	}

	grabar(): void {
		if (this.emmForm.invalid) {
			return;
		}
		this._snotifyService.info('La configuracion del EMM se guardo sin problema', { position: SnotifyPosition.rightTop });
	}

	crearTablasSincronizacion(): void {
		this._snotifyService.info('Las tablas de sincronizacion fueron creadas', { position: SnotifyPosition.rightTop });
	}
}
