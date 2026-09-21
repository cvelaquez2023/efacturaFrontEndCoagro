import { Injectable } from '@angular/core';
import { ICompaniaConsecutivoRuta, IRutaCabeceraAsignacion } from '../model/detalle-ruta-model-interface';

const CABECERA_VACIA: IRutaCabeceraAsignacion = {
	grupoArticulo: '',
	grupoArticuloNombre: '',
	agente: '',
	agenteNombre: '',
	handheld: '',
	handheldNombre: '',
	bodega: '',
	bodegaNombre: ''
};

/**
 * No hay backend para el detalle de consecutivos por compañía de una Ruta (confirmado: RUTA_RT
 * no tiene tabla hija de compañías). Se guarda en memoria mientras dura la sesión del navegador
 * para que abrir/cerrar el diálogo de Detalle no pierda lo capturado.
 */
const SEED: ICompaniaConsecutivoRuta[] = [
	{
		compania: 'FREEZONE',
		companiaNombre: 'Freezone Exactus',
		pais: 'SV',
		devolucion: 'devolucion1',
		pedido: 'pedido1',
		pedidoConDescuento: 'pedidocon1',
		factura: 'fact1',
		inventario: 'invent1',
		reciboCobro: 'recibocob1',
		notaCredito: 'notacred1',
		ncfConsumidorFinal: '',
		ncfCreditoFiscal: '',
		resolucionFactura: '',
		resolucionDevolucion: ''
	}
];

@Injectable({ providedIn: 'root' })
export class DetalleRutaMockStoreService {
	private _porRuta = new Map<string, ICompaniaConsecutivoRuta[]>();
	private _cabeceraPorRuta = new Map<string, IRutaCabeceraAsignacion>();

	getFilas(ruta: string): ICompaniaConsecutivoRuta[] {
		if (!this._porRuta.has(ruta)) {
			this._porRuta.set(ruta, SEED.map((fila) => ({ ...fila })));
		}
		return this._porRuta.get(ruta)!.map((fila) => ({ ...fila }));
	}

	guardarFilas(ruta: string, filas: ICompaniaConsecutivoRuta[]): void {
		this._porRuta.set(
			ruta,
			filas.map((fila) => ({ ...fila }))
		);
	}

	getCabecera(ruta: string): IRutaCabeceraAsignacion {
		return { ...(this._cabeceraPorRuta.get(ruta) ?? CABECERA_VACIA) };
	}

	guardarCabecera(ruta: string, cabecera: IRutaCabeceraAsignacion): void {
		this._cabeceraPorRuta.set(ruta, { ...cabecera });
	}
}
