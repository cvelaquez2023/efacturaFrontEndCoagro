import { IResponseLote } from './../model/lote-interface';
import { createAction, props } from '@ngrx/store';
export const loadLoteAccion = createAction('[Lote List] Load Lote');
export const loadedLoteAccion = createAction('[Lote List] Load Lote success', props<{ lote: IResponseLote[] }>());
