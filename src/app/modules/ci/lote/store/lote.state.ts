import { IResponseLote } from './../model/lote-interface';
export interface ILoteState {
	loading: boolean;
	lote: ReadonlyArray<IResponseLote>;
}
