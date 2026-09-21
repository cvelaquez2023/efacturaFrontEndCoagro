import { Injectable } from '@angular/core';
import { DiaSemana, IClienteRuta } from '../model/asignacion-ruta-model-interface';

/**
 * No existe backend para la asignación ruta-cliente-día ni para agentes/camión-bodega de FR
 * (confirmado contra el repo de backend). Se simula en memoria durante la sesión del navegador.
 */
@Injectable({ providedIn: 'root' })
export class AsignacionRutaMockStoreService {
	private _asignacionesPorRuta = new Map<string, IClienteRuta[]>();
	private _clientesEnOtrasRutas = new Set<string>();
	private _otrasRutasInicializado = false;

	getClientesRuta(ruta: string): IClienteRuta[] {
		if (!this._asignacionesPorRuta.has(ruta)) {
			this._asignacionesPorRuta.set(ruta, []);
		}
		return this._asignacionesPorRuta.get(ruta)!.map((c) => ({ ...c }));
	}

	guardarClientesRuta(ruta: string, clientes: IClienteRuta[]): void {
		this._asignacionesPorRuta.set(
			ruta,
			clientes.map((c) => ({ ...c }))
		);
	}

	/** Simula, la primera vez que se cargan los clientes, cuáles ya están asignados a OTRAS rutas. */
	inicializarSimulacion(codigosClientes: string[], rutaActual: string): void {
		if (this._otrasRutasInicializado) return;
		this._otrasRutasInicializado = true;
		codigosClientes.forEach((codigo, index) => {
			if (index % 3 === 0) this._clientesEnOtrasRutas.add(codigo);
		});

		const yaTieneAsignacion = this._asignacionesPorRuta.has(rutaActual) && this._asignacionesPorRuta.get(rutaActual)!.length > 0;
		if (!yaTieneAsignacion && codigosClientes.length > 0) {
			const diasSemilla: DiaSemana[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
			const semilla: IClienteRuta[] = codigosClientes.slice(0, Math.min(3, codigosClientes.length)).map((codigo, i) => ({
				cliente: codigo,
				nombre: '',
				dia: diasSemilla[i % diasSemilla.length],
				orden: 1
			}));
			this._asignacionesPorRuta.set(rutaActual, semilla);
		}
	}

	estaEnOtrasRutas(cliente: string): boolean {
		return this._clientesEnOtrasRutas.has(cliente);
	}
}
