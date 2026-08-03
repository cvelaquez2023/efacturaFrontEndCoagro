export interface IResponseUsuario {
	firstName: string;
	lastName: string;
	typeDocument: number;
	documentoNumber: string;
	email: string;
	password: string;
	confirmPassword: string;
	age?: number;
}
