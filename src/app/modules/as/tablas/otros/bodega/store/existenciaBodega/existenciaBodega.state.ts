import { IResponseConsultarExistenciaBodega } from './../../service/existenciaBodega-api-model-interface';

export interface IExistenciaBodegaState {
	loading: boolean;
	existenciaBodega: ReadonlyArray<IResponseConsultarExistenciaBodega>;
}
