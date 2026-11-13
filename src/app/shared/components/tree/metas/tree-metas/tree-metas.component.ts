import { NestedTreeControl } from "@angular/cdk/tree";
import { Component, OnInit } from "@angular/core";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { Router } from "@angular/router";
import { PATHS_METAS_PAGES } from "@app/config/path-page-metas";

interface MetasNode {
  name: string;
  constante: string;
  children?: MetasNode[];
}

const TREE_DATA: MetasNode[] = [
  {
    name: "Administración",
    constante: "grupo",
    children: [
      { name: "Metas", constante: "_metas" },
      { name: "Líneas de Negocio", constante: "_lineasNegocio" },
      { name: "Proveedores", constante: "_proveedores" },
      { name: "Líderes", constante: "_lideres" },
    ],
  },
  {
    name: "Cuadro de Control",
    constante: "grupo",
    children: [
      { name: "Dashboard", constante: "_dashboard" },
      { name: "Incentivo y Metas", constante: "_incentivoMetas" },
      { name: "Ventas Diarias", constante: "_ventasDiarias" },
    ],
  },
];

/** Menú del módulo principal "Metas" (barra lateral). */
@Component({
  selector: "app-tree-metas",
  templateUrl: "./tree-metas.component.html",
  styleUrls: ["./tree-metas.component.scss"],
})
export class TreeMetasComponent implements OnInit {
  constructor(private _router: Router) {}

  nestdDataSource = new MatTreeNestedDataSource<MetasNode>();
  nestdTreeControl = new NestedTreeControl<MetasNode>((node) => node.children);

  ngOnInit(): void {
    this.nestdDataSource.data = TREE_DATA;
  }

  hasNestedChild(index: number, node: MetasNode): number | undefined {
    return node?.children?.length;
  }

  navigateToPage(name: string): void {
    switch (name) {
      case "_metas":
        void this._router.navigateByUrl(PATHS_METAS_PAGES.metas.withSlash);
        break;
      case "_dashboard":
        void this._router.navigateByUrl(PATHS_METAS_PAGES.dashboard.withSlash);
        break;
      case "_ventasDiarias":
        void this._router.navigateByUrl(PATHS_METAS_PAGES.ventasDiarias.withSlash);
        break;
      case "_incentivoMetas":
        void this._router.navigateByUrl(PATHS_METAS_PAGES.incentivoMetas.withSlash);
        break;
      case "_lineasNegocio":
        void this._router.navigateByUrl(PATHS_METAS_PAGES.lineasNegocio.withSlash);
        break;
      case "_proveedores":
        void this._router.navigateByUrl(PATHS_METAS_PAGES.proveedores.withSlash);
        break;
      case "_lideres":
        void this._router.navigateByUrl(PATHS_METAS_PAGES.lideres.withSlash);
        break;
    }
  }
}
