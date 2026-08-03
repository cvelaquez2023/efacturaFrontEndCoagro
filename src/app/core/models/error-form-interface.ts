export interface IAtribute {
	formControlName: string;
	validators: IValidator[];
}

export interface IValidator {
	name: string;
	message: string;
}
