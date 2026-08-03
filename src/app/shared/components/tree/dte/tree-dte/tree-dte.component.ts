import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { PATHS_CI_PAGES } from '@app/config/path-page-ci';
import { PATHS_DTE_PAGES } from '@app/config/path-page.dte';

interface CiNode {
	name: string;
	constante: string;
	children?: CiNode[];
}

const TREE_DATA: CiNode[] = [
	{
		name: 'Clientes-DTESss',
		constante: 'demo',
		children: [
			{
				name: 'Listar Dtes',
				constante: '_articulos'
			},
			{
				name: 'Invalidaciones',
				constante: '_articulos'
			}
		]
	},
	{
		name: 'Proveedores-Dtes2025',
		constante: 'demo',
		children: [
			{
				name: 'Listar',
				constante: '_lote'
			}
		]
	},
	{
		name: 'Contingencia',
		constante: 'demo',
		children: [
			{
				name: 'Paquete',
				constante: '_paquete'
			},
			{
				name: 'En Linea',
				constante: '_enlinea'
			}
		]
	},
	{
		name: 'Usuarios',
		constante: 'demo',
		children: [
			{
				name: 'Lotes',
				constante: '_lote'
			}
		]
	}
];
@Component({
	selector: 'app-tree-dte',
	templateUrl: './tree-dte.component.html',
	styleUrls: ['./tree-dte.component.scss']
})
export class TreeDteComponent implements OnInit {
	constructor(private _router: Router) {}

	nestdDataSource = new MatTreeNestedDataSource<CiNode>();
	nestdTreeControl = new NestedTreeControl<CiNode>((node) => node.children);
	ngOnInit(): void {
		this.nestdDataSource.data = TREE_DATA;
	}
	hasNestedChild(index: number, node: CiNode): number | undefined {
		return node?.children?.length;
	}
	navigateToPage(name: string): void {
		switch (name) {
			case '_clientes':
				void this._router.navigateByUrl(PATHS_DTE_PAGES.clienteDte.withSlash);
				break;
			case '_proveedor':
				void this._router.navigateByUrl(PATHS_DTE_PAGES.proveedorDte.withSlash);
				break;
			case '_contingencia':
				void this._router.navigateByUrl(PATHS_DTE_PAGES.contingenciaDte.withSlash);
				break;
			case '_usuario':
				void this._router.navigateByUrl(PATHS_DTE_PAGES.usuarioDte.withSlash);
				break;
			default:
				break;
		}
	}
}
