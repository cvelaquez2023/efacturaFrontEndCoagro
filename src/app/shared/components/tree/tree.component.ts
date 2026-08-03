import { PATH_AS_PAGES } from './../../../config/path-pages';
import { Router } from '@angular/router';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { PATHS_CLIENTE_PAGES } from '@app/config/path-page-cliente';
import { PATHS_DTE_PAGES } from '@app/config/path-page.dte';

interface AdminNode {
	name: string;
	constante: string;
	children?: AdminNode[];
}

const TREE_DATA: AdminNode[] = [
	{
		name: 'Dtes',
		constante: '_dteCliente',
		children: []
	},
	{
		name: 'Invalidaciones',
		constante: '_crearInvalidaciones',
		children: []
	}
];

@Component({
	selector: 'app-tree',
	templateUrl: './tree.component.html',
	styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {
	constructor(private _router: Router) {}
	nestdDataSource = new MatTreeNestedDataSource<AdminNode>();
	nestdTreeControl = new NestedTreeControl<AdminNode>((node) => node.children);
	ngOnInit(): void {
		this.nestdDataSource.data = TREE_DATA;
	}

	hasNestedChild(index: number, node: AdminNode): number | undefined {
		return node?.children?.length;
	}

	navigateToPage(name: string): void {
		switch (name) {
			//Seguridad
			case '_dteCliente':
				void this._router.navigateByUrl(PATHS_DTE_PAGES.clienteDte.withSlash);
				break;
			case '_listarDte':
				void this._router.navigateByUrl(PATHS_CLIENTE_PAGES.documento.withSlash);
				break;
			case '_crearInvalidaciones':
				void this._router.navigateByUrl(PATHS_DTE_PAGES.invalidacionDte.withSlash);
				break;
			//Tablas/areas
			case '_listarInvalidaciones':
				void this._router.navigateByUrl(PATH_AS_PAGES.listarInvalidacion.withSlash);
				break;
			case '_usuarios':
				void this._router.navigateByUrl(PATH_AS_PAGES.listarInvalidacion.withSlash);
				break;
			default:
				break;
		}
	}
}
