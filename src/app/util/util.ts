export class Util {
	/**
	 * Esta funcion se encarga de concatenar los valores del array 'values' con el separador slash "/".
	 * ejemplo
	 *
	 * ['value',1,8]-> output:"value/1/8"
	 *
	 * @param values
	 * @returns
	 */
	static concatPath(values: unknown[]): string {
		return values.join('/');
	}
}
