import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { PATHS_CG_PAGES } from '@app/config/path-page-cg';

interface CgNode {
	name: string;
	constante: string;
	children?: CgNode[];
}

const TREE_DATA: CgNode[] = [
	{
		name: 'Cuentas',
		constante: 'demo',
		children: [
			{
				name: 'Cuentas',
				constante: '_cuentas'
			}
		]
	},
	{
		name: 'Transacciones',
		constante: 'demo',
		children: [
			{
				name: 'Diario',
				constante: '_diario'
			},
			{
				name: 'Recurente',
				constante: '_recurente'
			},
			{
				name: 'Distribuidas',
				constante: '_distribuidas'
			},
			{
				name: 'Anulación',
				constante: '_anulacion'
			},
			{
				name: 'Reversión',
				constante: '_reversion'
			}
		]
	},
	{
		name: 'Consultas',
		constante: 'demo',
		children: [
			{
				name: 'De Cuentas Contables',
				constante: '_deCuentasContables'
			},
			{
				name: 'De Centro de Costo',
				constante: '_deCentroCosto'
			},
			{
				name: 'Por Periodos Contables',
				constante: '_porPeriodosContables'
			},
			{
				name: 'Libro Mayor',
				constante: '_libroMayor'
			},
			{
				name: 'Asiento del Mayor',
				constante: '_asientoDelMayor'
			},
			{
				name: 'Transacciones del Mayor',
				constante: '_transaccionesDelMayor'
			},
			{
				name: 'Asiento del Diario',
				constante: '_asientoDelDiario'
			},
			{
				name: 'Transacciones del Diario',
				constante: '_transaccionesDelDiario'
			}
		]
	},
	{
		name: 'Reportes',
		constante: 'demo',
		children: [
			{
				name: 'Balance de Comprobación Por Cuenta',
				constante: '_balanceDeComprobacionPorCuenta'
			},
			{
				name: 'Balance de Comprobación Por Centro Costo',
				constante: '_balanceDeComprobacionPorCentroCosto'
			},
			{
				name: 'Balance General',
				constante: '_balanceGeneral'
			},
			{
				name: 'Estado de Resultado',
				constante: '_estadoDeResultado'
			},
			{
				name: 'Reporte de Asientos',
				constante: '_reporteDeAsientos'
			},
			{
				name: 'Reporte de Libro Mayor',
				constante: '_reporteDeLibroMayor'
			},
			{
				name: 'Reporte F987',
				constante: '_reporteF987'
			}
		]
	},
	{
		name: 'Procesos',
		constante: 'demo',
		children: [
			{
				name: 'Cierre Anual',
				constante: '_cierreAnual'
			},
			{
				name: 'Recalculo de Saldos',
				constante: '_recalculoDeSaldos'
			}
		]
	},
	{
		name: 'Administración',
		constante: 'demo',
		children: [
			{
				name: 'Paquetes',
				constante: '_paquetes'
			},
			{
				name: 'Tipo de Transacciones Contables',
				constante: '_tipoDeTransaccionesContables'
			},
			{
				name: 'Asignación Centro-Cuenta',
				constante: '_asignacionCentroCuenta'
			},
			{
				name: 'Reporte Contable',
				constante: '_reporteContable'
			},
			{
				name: 'Parametros del Módulo',
				constante: '_parametrosDelModulo'
			}
		]
	}
];

@Component({
	selector: 'app-tree-cg',
	templateUrl: './tree-cg.component.html',
	styleUrls: ['./tree-cg.component.scss']
})
export class TreeCgComponent implements OnInit {
	constructor(private _router: Router) {}

	nestdDataSource = new MatTreeNestedDataSource<CgNode>();
	nestdTreeControl = new NestedTreeControl<CgNode>((node) => node.children);

	ngOnInit(): void {
		this.nestdDataSource.data = TREE_DATA;
	}
	hasNestedChild(index: number, node: CgNode): number | undefined {
		return node?.children?.length;
	}
	navigateToPage(name: string): void {
		switch (name) {
			case '_cuentas':
				void this._router.navigateByUrl(PATHS_CG_PAGES.cuentaContable.withSlash);
				break;
			//Transacciones
			case '_diario':
				void this._router.navigateByUrl(PATHS_CG_PAGES.cuentaContable.withSlash);
				break;
			case '_recurente':
				void this._router.navigateByUrl(PATHS_CG_PAGES.cuentaContable.withSlash);
				break;
			case '_distribuidas':
				void this._router.navigateByUrl(PATHS_CG_PAGES.cuentaContable.withSlash);
				break;
			case '_anulacion':
				void this._router.navigateByUrl(PATHS_CG_PAGES.cuentaContable.withSlash);
				break;
			case '_reversion':
				void this._router.navigateByUrl(PATHS_CG_PAGES.cuentaContable.withSlash);
				break;
			//Consulta
			//Reporte
			//Proceso
			//Administracion
			case '_paquetes':
				void this._router.navigateByUrl(PATHS_CG_PAGES.cuentaContable.withSlash);
				break;
			case '_tipoDeTransaccionContable':
				void this._router.navigateByUrl(PATHS_CG_PAGES.cuentaContable.withSlash);
				break;
			case '_asignacionCentroCuenta':
				void this._router.navigateByUrl(PATHS_CG_PAGES.centroCuenta.withSlash);
				break;
			case '_reporteContable':
				void this._router.navigateByUrl(PATHS_CG_PAGES.cuentaContable.withSlash);
				break;
			case '_parametrosDelModulo':
				void this._router.navigateByUrl(PATHS_CG_PAGES.parametrosModulo.withSlash);
				break;
			default:
				break;
		}
	}
}
