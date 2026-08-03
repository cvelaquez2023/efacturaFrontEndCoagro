import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { PATHS_CI_PAGES } from '@app/config/path-page-ci';
import { PATHS_PROVEE_PAGES } from '@app/config/path-page-prove';
import { PATHS_DTE_PAGES } from '@app/config/path-page.dte';

interface UsuarioNode {
	name: string;
	constante: string;
	children?: UsuarioNode[];
}
const TREE_DATA: UsuarioNode[] = [
	{
		name: 'Listar Usuarios',
		constante: '_listarDte',
		children: []
	}
];
@Component({
	selector: 'app-tree-usuario',
	templateUrl: './tree-usuario.component.html',
	styleUrls: ['./tree-usuario.component.scss']
})
export class TreeUsuarioComponent implements OnInit {
	constructor(private _router: Router) {}
	nestdDataSource = new MatTreeNestedDataSource<UsuarioNode>();
	nestdTreeControl = new NestedTreeControl<UsuarioNode>((node) => node.children);

	ngOnInit(): void {
		this.nestdDataSource.data = TREE_DATA;
	}
	hasNestedChild(index: number, node: UsuarioNode): number | undefined {
		return node?.children?.length;
	}
	navigateToPage(name: string): void {
		switch (name) {
			case '_listarDte':
				void this._router.navigateByUrl(PATHS_DTE_PAGES.usuarioDte.withSlash);
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
