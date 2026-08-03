import { AbstractControl } from '@angular/forms';
import { IAtribute } from '../core/models/error-form-interface';

export const validateFieldForm = (model: IAtribute[], formControlName: string, control: AbstractControl): string[] => {
	const atributeError = model.find((x) => x.formControlName == formControlName);
	if (atributeError) {
		const validators = atributeError.validators.filter((validator) => control.errors![validator.name]);
		return validators.map((validator) => validator.message);
	}
	return [];
};
