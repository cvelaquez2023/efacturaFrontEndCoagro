import { IResponseLocaizacionBodega } from '../../model/bodega.interface';
export interface ILocalizacionState {
	loading: boolean;
	localizacion: ReadonlyArray<IResponseLocaizacionBodega>;
}
