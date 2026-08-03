export interface IResponse<T = void> {
	success: boolean;
	errors: string[];
	result: T;
}
