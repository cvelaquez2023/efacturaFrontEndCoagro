import { loteReducer } from './../modules/ci/lote/store/lote.reducer';
import { ILoteState } from './../modules/ci/lote/store/lote.state';
import { exsitenciaBodegaReducer } from './../modules/as/tablas/otros/bodega/store/existenciaBodega/existenciaBodega.reducer';
import { IExistenciaBodegaState } from './../modules/as/tablas/otros/bodega/store/existenciaBodega/existenciaBodega.state';
import { ICondicionPagoState } from './../modules/as/tablas/tipos/condcion-pago/store/condiconPago.state';
import { globalesCIReducer } from './../modules/ci/store/ci.reducer';
import { globalesASReducer } from './../modules/as/strore/as.reducer';
import { bodegaReducer } from './../modules/as/tablas/otros/bodega/store/bodega.reducer';
import { localizacionReducer } from './../modules/as/tablas/otros/bodega/store/localizaciones/loc.reducer';
import { articuloReducer } from '@app/modules/ci/articulo/store/articulo.reducer';
import { ActionReducerMap } from '@ngrx/store';

import { IGlobalesAS_State } from './../modules/as/strore/as.state';
import { IGlobalesCI_State } from '@app/modules/ci/store/ci.state';
import { IBodega_State } from '@app/modules/as/tablas/otros/bodega/store/bodega.state';
import { ILocalizacionState } from '@app/modules/as/tablas/otros/bodega/store/localizaciones/loc.state';
import { IArticuloCI_State } from '@app/modules/ci/articulo/store/articulo.state';
import { CondicionPagoReducer } from './../modules/as/tablas/tipos/condcion-pago/store/condicionPago.reducer';
export interface AppState {
	globalesAS: IGlobalesAS_State;
	globalesCI: IGlobalesCI_State;
	bodega: IBodega_State;
	localizacion: ILocalizacionState;
	articulo: IArticuloCI_State;
	condicionPago: ICondicionPagoState;
	existenciaBodega: IExistenciaBodegaState;
	lote: ILoteState;
}

export const ROOT_REDUCERS: ActionReducerMap<AppState> = {
	globalesAS: globalesASReducer,
	globalesCI: globalesCIReducer,
	bodega: bodegaReducer,
	localizacion: localizacionReducer,
	articulo: articuloReducer,
	condicionPago: CondicionPagoReducer,
	existenciaBodega: exsitenciaBodegaReducer,
	lote: loteReducer
};
