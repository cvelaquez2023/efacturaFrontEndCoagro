import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-add-categoria-page',
	templateUrl: './add-categoria-page.component.html',
	styleUrls: ['./add-categoria-page.component.scss']
})
export class AddCategoriaPageComponent {
	constructor(private _formBuilder: FormBuilder) {
		this._loadFormulario();
	}
	formCategoriaCliente!: FormGroup;
	private _loadFormulario(): void {
		this.formCategoriaCliente = this._formBuilder.group({
			categoria: ['', [Validators.required, Validators.maxLength(10)]]
		});
	}
}
