import { Iglobales_CI } from '../model/globales_CI.interface';

export interface IGlobalesCI_State {
	loading: boolean;
	datos: ReadonlyArray<Iglobales_CI>;
}
