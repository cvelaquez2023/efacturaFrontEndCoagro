import { IResponseConsultarExistenciaBodega } from './../../service/existenciaBodega-api-model-interface';
import { createAction, props } from '@ngrx/store';
export const loadExistenciaBodega = createAction('[ExistenciaBodega List] Load ExistenciaBodega');
export const loadedExistenciaBodega = createAction(
	'[ExistenciaBodega List] Load ExistenciaBodega success',
	props<{ existenciaBodega: IResponseConsultarExistenciaBodega[] }>()
);
