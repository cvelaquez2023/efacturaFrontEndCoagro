import { Iglobales_AS } from '../model/Globales_AS.interface';

export interface IGlobalesAS_State {
	loading: boolean;
	items: ReadonlyArray<Iglobales_AS>;
}
