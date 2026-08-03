import { IResquestConsultarArticulo } from '../model/articulo-api-model-interface';
export interface IArticuloCI_State {
	loading: boolean;
	articulo: ReadonlyArray<IResquestConsultarArticulo>;
}
