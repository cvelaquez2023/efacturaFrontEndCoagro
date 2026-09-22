import { NestedTreeControl } from "@angular/cdk/tree";
import { Component, OnInit } from "@angular/core";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { Router } from "@angular/router";
import { PATHS_FR_PAGES } from "@app/config/path-page-fr";

interface FrNode {
  name: string;
  constante: string;
  children?: FrNode[];
}

const TREE_DATA: FrNode[] = [
  {
    name: "Rutas",
    constante: "demo",
    children: [
      {
        name: "Rutas",
        constante: "_rutas",
      },
      {
        name: "Asignación de Rutas",
        constante: "_asignacionRutas",
      },
    ],
  },
  {
    name: "Documentos",
    constante: "demo",
    children: [
      {
        name: "Devoluciones",
        constante: "_devoluciones",
      },
      {
        name: "Aprobar Devolución",
        constante: "_aprobarDevolucion",
      },
    ],
  },
  {
    name: "Reportes",
    constante: "demo",
    children: [
      {
        name: "Documentos No Cargados",
        constante: "_documentosNoCargados",
      },
      {
        name: "Bitácora de Sincronización",
        constante: "_bitacoraSincronizacion",
      },
      {
        name: "Clientes en Abandono",
        constante: "_clientesAbandono",
      },
      {
        name: "Histórico de Visitas",
        constante: "_historicoVisitas",
      },
      {
        name: "Ventas en Consignación",
        constante: "_ventasConsignacion",
      },
      {
        name: "Documentos Generados en FR",
        constante: "_documentosGeneradosFr",
      },
      {
        name: "Liquidación de Agentes",
        constante: "_liquidacionAgentes",
      },
      {
        name: "Visitas por Día",
        constante: "_visitasDia",
      },
      {
        name: "Ubicaciones por Visita",
        constante: "_ubicacionesVisita",
      },
    ],
  },
  {
    name: "Procesos",
    constante: "demo",
    children: [
      {
        name: "Carga de Clientes",
        constante: "_cargaClientes",
      },
      {
        name: "Carga de Artículos",
        constante: "_cargaArticulos",
      },
      {
        name: "Carga de Bodegas",
        constante: "_cargaBodegas",
      },
      {
        name: "Carga Handheld",
        constante: "_cargaHandheld",
      },
      {
        name: "Carga ERP",
        constante: "_cargaErp",
      },
      {
        name: "ConfiguracionHH",
        constante: "_configuracionHH",
      },
      {
        name: "Carga Ubicaciones de Clientes",
        constante: "_cargaUbicacionesClientes",
      },
      {
        name: "Cierre de Jornada",
        constante: "_cierreJornada",
      },
    ],
  },
  {
    name: "Administración",
    constante: "demo",
    children: [
      {
        name: "HandHelds",
        constante: "_handhelds",
      },
      {
        name: "Clientes",
        constante: "_clientes",
      },
      {
        name: "Artículos",
        constante: "_articulos",
      },
      {
        name: "Grupos de Artículos",
        constante: "_gruposArticulos",
      },
      {
        name: "Visitas",
        constante: "_visitas",
      },
      {
        name: "Razones de Efectividad de Visita",
        constante: "_razonesVisita",
      },
      {
        name: "Sugeridos de Venta",
        constante: "_sugeridosVenta",
      },
      {
        name: "Asignación de Sugeridos de Venta",
        constante: "_asignacionSugeridosVenta",
      },
      {
        name: "Bodegas",
        constante: "_bodegas",
      },
      {
        name: "Agentes",
        constante: "_agentes",
      },
      {
        name: "EMM",
        constante: "_emm",
      },
      {
        name: "Control de Archivos y Actualizaciones",
        constante: "_controlArchivosActualizaciones",
      },
      {
        name: "Monitoreo Documentos",
        constante: "_monitoreoDocumentos",
      },
      {
        name: "Parámetros del Módulo",
        constante: "_parametrosModulo",
      },
      {
        name: "Dashboard General",
        constante: "_dashboardGeneral",
      },
      {
        name: "Metas de Venta y Cobro",
        constante: "_metasVentaCobro",
      },
    ],
  },
  {
    name: "Acerca de",
    constante: "_acercaDe",
  },
];

@Component({
  selector: "app-tree-fr",
  templateUrl: "./tree-fr.component.html",
  styleUrls: ["./tree-fr.component.scss"],
})
export class TreeFrComponent implements OnInit {
  constructor(private _router: Router) {}

  nestdDataSource = new MatTreeNestedDataSource<FrNode>();
  nestdTreeControl = new NestedTreeControl<FrNode>((node) => node.children);

  ngOnInit(): void {
    this.nestdDataSource.data = TREE_DATA;
  }
  hasNestedChild(index: number, node: FrNode): number | undefined {
    return node?.children?.length;
  }
  navigateToPage(name: string): void {
    switch (name) {
      case "_rutas":
        void this._router.navigateByUrl(PATHS_FR_PAGES.rutas.withSlash);
        break;
      case "_asignacionRutas":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.asignacionRutas.withSlash
        );
        break;
      case "_devoluciones":
        void this._router.navigateByUrl(PATHS_FR_PAGES.devoluciones.withSlash);
        break;
      case "_aprobarDevolucion":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.aprobarDevolucion.withSlash
        );
        break;
      case "_documentosNoCargados":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.documentosNoCargados.withSlash
        );
        break;
      case "_bitacoraSincronizacion":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.bitacoraSincronizacion.withSlash
        );
        break;
      case "_clientesAbandono":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.clientesAbandono.withSlash
        );
        break;
      case "_historicoVisitas":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.historicoVisitas.withSlash
        );
        break;
      case "_ventasConsignacion":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.ventasConsignacion.withSlash
        );
        break;
      case "_documentosGeneradosFr":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.documentosGeneradosFr.withSlash
        );
        break;
      case "_liquidacionAgentes":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.liquidacionAgentes.withSlash
        );
        break;
      case "_visitasDia":
        void this._router.navigateByUrl(PATHS_FR_PAGES.visitasDia.withSlash);
        break;
      case "_ubicacionesVisita":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.ubicacionesVisita.withSlash
        );
        break;
      case "_cargaClientes":
        void this._router.navigateByUrl(PATHS_FR_PAGES.cargaClientes.withSlash);
        break;
      case "_cargaArticulos":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.cargaArticulos.withSlash
        );
        break;
      case "_cargaBodegas":
        void this._router.navigateByUrl(PATHS_FR_PAGES.cargaBodegas.withSlash);
        break;
      case "_cargaHandheld":
        void this._router.navigateByUrl(PATHS_FR_PAGES.cargaHandheld.withSlash);
        break;
      case "_cargaErp":
        void this._router.navigateByUrl(PATHS_FR_PAGES.cargaErp.withSlash);
        break;
      case "_configuracionHH":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.configuracionHH.withSlash
        );
        break;
      case "_cargaUbicacionesClientes":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.cargaUbicacionesClientes.withSlash
        );
        break;
      case "_cierreJornada":
        void this._router.navigateByUrl(PATHS_FR_PAGES.cierreJornada.withSlash);
        break;
      case "_handhelds":
        void this._router.navigateByUrl(PATHS_FR_PAGES.handhelds.withSlash);
        break;
      case "_clientes":
        void this._router.navigateByUrl(PATHS_FR_PAGES.clientes.withSlash);
        break;
      case "_articulos":
        void this._router.navigateByUrl(PATHS_FR_PAGES.articulos.withSlash);
        break;
      case "_gruposArticulos":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.gruposArticulos.withSlash
        );
        break;
      case "_visitas":
        void this._router.navigateByUrl(PATHS_FR_PAGES.visitas.withSlash);
        break;
      case "_razonesVisita":
        void this._router.navigateByUrl(PATHS_FR_PAGES.razonesVisita.withSlash);
        break;
      case "_sugeridosVenta":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.sugeridosVenta.withSlash
        );
        break;
      case "_asignacionSugeridosVenta":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.asignacionSugeridosVenta.withSlash
        );
        break;
      case "_bodegas":
        void this._router.navigateByUrl(PATHS_FR_PAGES.bodegas.withSlash);
        break;
      case "_agentes":
        void this._router.navigateByUrl(PATHS_FR_PAGES.agentes.withSlash);
        break;
      case "_emm":
        void this._router.navigateByUrl(PATHS_FR_PAGES.emm.withSlash);
        break;
      case "_controlArchivosActualizaciones":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.controlArchivosActualizaciones.withSlash
        );
        break;
      case "_monitoreoDocumentos":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.monitoreoDocumentos.withSlash
        );
        break;
      case "_parametrosModulo":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.parametrosModulo.withSlash
        );
        break;
      case "_dashboardGeneral":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.dashboardGeneral.withSlash
        );
        break;
      case "_metasVentaCobro":
        void this._router.navigateByUrl(
          PATHS_FR_PAGES.metasVentaCobro.withSlash
        );
        break;
      case "_acercaDe":
        void this._router.navigateByUrl(PATHS_FR_PAGES.acercaDe.withSlash);
        break;
      default:
        break;
    }
  }
}
