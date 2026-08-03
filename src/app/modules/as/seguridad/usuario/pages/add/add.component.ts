import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PATHS_AUTH_PAGES } from '@app/config/path-pages';
import {
	MODEL_REGISTER_ERRORS,
	customConfirmValidator,
	customPasswordValidator
} from '@app/modules/auth/pages/register-page/register-page/register-custon-validators';
import { IRequestRegister } from '@app/modules/auth/services/api/user-api-model-interface';
import { UserApiService } from '@app/modules/auth/services/api/user-api.service';
import { DOCUMENT_TYPE } from '@app/util/enums';
import { validateFieldForm } from '@app/util/validate-form-util';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { UsuarioApiService } from '../../service/usuario-api.service';

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.scss']
})
export class AddComponent {
	constructor(
		private _formBuilder: FormBuilder,
		private _router: Router,
		private _userApiService: UsuarioApiService,
		private _snotifyService: SnotifyService,
		private _dialogRef: MatDialogRef<AddComponent>
	) {
		this._loadFormGroup();
	}
	//ngOnInit(): void {}
	formGroup!: FormGroup;
	private _loadFormGroup(): void {
		this.formGroup = this._formBuilder.group({
			firstName: [null, Validators.required],
			lastName: [null, Validators.required],
			typeDocument: [null, Validators.required],
			documentNumber: [null, [Validators.required, this._validateDocument()]],
			email: [null, [Validators.required, Validators.email]],
			password: [null, [Validators.required, customPasswordValidator(), customConfirmValidator('password')]],
			confirmPassword: [null, [Validators.required, customConfirmValidator('confirmPassword')]],
			age: null
		});
	}
	clickRegister(): void {
		console.log(this._getRequest());
		if (this.formGroup.invalid) {
			return;
		}
		console.log('registramos');
		this._userApiService.createUser(this._getRequest()).subscribe((response) => {
			if (response.success) {
				this.formGroup.reset();
				this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
				this._dialogRef.close('save');

				//				void this._router.navigateByUrl(PATHS_AUTH_PAGES.LoginPage.withSlash);
			} else {
				this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
			}
		});
	}
	private _validateDocument(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const nrDocument = control.value as string;
			const validatorError: ValidationErrors = {};
			if (nrDocument && this.typeDocumentField) {
				const typeDocument = this.typeDocumentField.value as number;
				if (typeDocument == DOCUMENT_TYPE.DUI && nrDocument.length !== 10) {
					validatorError['dnierror'] = true;
					return validatorError;
				}
			}
			return validatorError;
		};
	}

	private _getRequest(): IRequestRegister {
		return {
			firstName: this.firtsField.value as string,
			lastName: this.lastNameField.value as string,
			typeDocument: this.typeDocumentField.value as number,
			documentoNumber: this.documentNumberField.value as string,
			email: this.emailField.value as string,
			password: this.passwordField.value as string,
			confirmPassword: this.confirmPasswordField.value as string,
			age: this.ageField.value ? (this.ageField.value as number) : undefined
		};
	}
	getErrors(controlName: string): string[] {
		const control = this.formGroup.get(controlName);
		if (control && control.invalid && control.touched) {
			return validateFieldForm(MODEL_REGISTER_ERRORS, controlName, control);
		}
		return [];
	}
	get firtsField(): AbstractControl {
		return this.formGroup.get('firstName')!;
	}
	get lastNameField(): AbstractControl {
		return this.formGroup.get('lastName')!;
	}

	get typeDocumentField(): AbstractControl {
		return this.formGroup.get('typeDocument')!;
	}

	get documentNumberField(): AbstractControl {
		return this.formGroup.get('documentNumber')!;
	}

	get emailField(): AbstractControl {
		return this.formGroup.get('email')!;
	}

	get passwordField(): AbstractControl {
		return this.formGroup.get('password')!;
	}

	get confirmPasswordField(): AbstractControl {
		return this.formGroup.get('confirmPassword')!;
	}

	get ageField(): AbstractControl {
		return this.formGroup.get('age')!;
	}
}
