import { ICondicionPagoConsulta } from './../models/condicionPago-api-model-interface';
export interface ICondicionPagoState {
	loading: boolean;
	condicionPago: ReadonlyArray<ICondicionPagoConsulta>;
}
