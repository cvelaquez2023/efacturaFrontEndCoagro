import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { PATHS_CI_PAGES } from '@app/config/path-page-ci';
import { PATHS_PROVEE_PAGES } from '@app/config/path-page-prove';
interface ProveedorNode {
	name: string;
	constante: string;
	children?: ProveedorNode[];
}
const TREE_DATA: ProveedorNode[] = [
	{
		name: 'Dtes',
		constante: '_listarDte',
		children: []
	},

	{
		name: 'Retención',
		constante: '_listaCargaJson',
		children: []
	},
	{
		name: 'Sujeto Excludio',
		constante: '_listarSujetoExcluido',
		children: []
	},
	{
		name: 'Invalidaciones',
		constante: '_listarInvalidaciones',
		children: []
	}
];

@Component({
	selector: 'app-tree-proveedor',
	templateUrl: './tree-proveedor.component.html',
	styleUrls: ['./tree-proveedor.component.scss']
})
export class TreeProveedorComponent implements OnInit {
	constructor(private _router: Router) {}
	nestdDataSource = new MatTreeNestedDataSource<ProveedorNode>();
	nestdTreeControl = new NestedTreeControl<ProveedorNode>((node) => node.children);

	ngOnInit(): void {
		this.nestdDataSource.data = TREE_DATA;
	}
	hasNestedChild(index: number, node: ProveedorNode): number | undefined {
		return node?.children?.length;
	}
	navigateToPage(name: string): void {
		switch (name) {
			case '_listarDte':
				void this._router.navigateByUrl(PATHS_CI_PAGES.articulo.withSlash);
				break;
			case '_listaCargaJson':
				void this._router.navigateByUrl(PATHS_CI_PAGES.lote.withSlash);
				break;
			case '_listarSujetoExcluido':
				void this._router.navigateByUrl(PATHS_PROVEE_PAGES.sujetoexcluido.withSlash);
				break;
			case '_listarInvalidaciones':
				void this._router.navigateByUrl(PATHS_PROVEE_PAGES.invalidacion.withSlash);
				break;

			default:
				break;
		}
	}
}
