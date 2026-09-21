import { Component } from '@angular/core';

interface IKpiCard {
	titulo: string;
	valor: string;
	icono: string;
	color: 'primary' | 'accent' | 'warn';
}

interface IRankingRuta {
	ruta: string;
	agente: string;
	visitas: number;
	vendido: number;
}

// Pantalla solo visual: no existe endpoint real de indicadores para FR. Datos de muestra
// solo con fines de maquetacion, no representan cifras reales de la operacion.
const MOCK_KPIS: IKpiCard[] = [
	{ titulo: 'Rutas Activas', valor: '18', icono: 'alt_route', color: 'primary' },
	{ titulo: 'Visitas Hoy', valor: '132', icono: 'storefront', color: 'accent' },
	{ titulo: 'Vendido Hoy', valor: '$8,420.00', icono: 'payments', color: 'primary' },
	{ titulo: 'Clientes en Abandono', valor: '9', icono: 'warning', color: 'warn' }
];

const MOCK_RANKING: IRankingRuta[] = [
	{ ruta: 'R001', agente: 'AG01', visitas: 8, vendido: 640.5 },
	{ ruta: 'R002', agente: 'AG02', visitas: 6, vendido: 410.0 },
	{ ruta: 'R003', agente: 'AG04', visitas: 5, vendido: 305.75 }
];

@Component({
	selector: 'app-dashboard-general-page',
	templateUrl: './dashboard-general-page.component.html',
	styleUrls: ['./dashboard-general-page.component.scss']
})
export class DashboardGeneralPageComponent {
	kpis: IKpiCard[] = MOCK_KPIS;
	ranking: IRankingRuta[] = MOCK_RANKING;
	rankingColumns = ['ruta', 'agente', 'visitas', 'vendido'];
}
