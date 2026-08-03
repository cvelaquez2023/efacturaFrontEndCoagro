import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { IAtribute } from '../../../../../core/models/error-form-interface';

const patternUpperCase = new RegExp('^(?=.*[A-Z])');
const patternLowerCase = new RegExp('^(?=.*[a-z])');
const patternNumber = new RegExp('^(?=.*[0-9])');

export function customPasswordValidator(): ValidatorFn {
	//password
	return (control: AbstractControl): ValidationErrors | null => {
		const value = control.value as string;
		const validatorError: ValidationErrors = {};

		if (!patternUpperCase.test(value)) {
			validatorError['validateUpperCase'] = true;
		}

		if (!patternLowerCase.test(value)) {
			validatorError['validateLowerCase'] = true;
		}

		if (!patternNumber.test(value)) {
			validatorError['validateNumber'] = true;
		}

		if (value && value.length < 8) {
			validatorError['validateLength'] = true;
		}

		if (Object.keys(validatorError).length === 0) {
			return null;
		}

		return validatorError;
	};
}

export function customConfirmValidator(name: string): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		if (control.parent) {
			const passwordControl = control.parent.get('password')!;
			const confirmPasswordControl = control.parent.get('confirmPassword')!;

			if (!passwordControl || !confirmPasswordControl) {
				return { customConfirmValidator: true };
			}

			const pass = passwordControl.value as string;
			const confirmPass = confirmPasswordControl.value as string;

			if (pass !== confirmPass) {
				if (name === 'password') {
					confirmPasswordControl.setErrors({ customConfirmValidator: true });
					return null;
				}
				// QUIERE DECIR QUE ESTAMOS EN LA CASILLA DE  confirmPassword
				return { customConfirmValidator: true };
			}

			if (name === 'password') {
				confirmPasswordControl.setErrors(null);
				return null;
			}
		}

		return null;
	};
}

const _getErrorPassword = (formControlName: string): IAtribute => {
	return {
		formControlName: formControlName,
		validators: [
			{
				name: 'required',
				message: 'El ingreso de la contraseña es obligatorio.'
			},
			{
				name: 'validateUpperCase',
				message: 'La contraseña debe de tener al menos una mayúscula.'
			},
			{
				name: 'validateLowerCase',
				message: 'La contraseña debe de tener al menos una minúscula.'
			},
			{
				name: 'validateNumber',
				message: 'La contraseña debe de tener al menos una número.'
			},
			{
				name: 'validateLength',
				message: 'La contraseña debe tener al menos 8 caracteres.'
			},
			{
				name: 'customConfirmValidator',
				message: 'Las contraseñas no coinciden, verifique.'
			}
		]
	};
};

export const MODEL_REGISTER_ERRORS: IAtribute[] = [
	{
		formControlName: 'firstName',
		validators: [
			{
				name: 'required',
				message: 'El ingreso del nombre es obligatorio.'
			}
		]
	},
	{
		formControlName: 'lastName',
		validators: [
			{
				name: 'required',
				message: 'El ingreso del Apellido es obligatorio.'
			}
		]
	},
	{
		formControlName: 'email',
		validators: [
			{
				name: 'required',
				message: 'El ingreso del email es obligatorio.'
			},
			{
				name: 'email',
				message: 'EL correo ingresado es invalido; ejemplo: user@domain.com'
			}
		]
	},
	{
		formControlName: 'birthDate',
		validators: [
			{
				name: 'required',
				message: 'El ingreso de la fecha es obligatorio.'
			}
		]
	},
	{
		formControlName: 'userCode',
		validators: [
			{
				name: 'required',
				message: 'El ingreso del usuario es obligatorio.'
			}
		]
	},
	_getErrorPassword('password'),
	_getErrorPassword('confirmPassword')
];
