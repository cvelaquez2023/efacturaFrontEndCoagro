import { IResponseBodega } from '../model/bodega.interface';

export interface IBodega_State {
	loading: boolean;
	bodega: ReadonlyArray<IResponseBodega>;
}
