import { PATHS_FR_PAGES } from '@app/config/path-page-fr';
import { FacturacionRutasPageComponent } from './pages/facturacion-rutas-page/facturacion-rutas-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';

const routes: Routes = [
	{
		path: '',
		component: FacturacionRutasPageComponent,
		canActivate: [AuthGuard]
	},
	//Rutas
	{
		path: PATHS_FR_PAGES.rutas.onLyPath,
		loadChildren: () => import('../fr/rutas/rutas/rutas.module').then((m) => m.RutasModule)
	},
	{
		path: PATHS_FR_PAGES.asignacionRutas.onLyPath,
		loadChildren: () => import('../fr/rutas/asignacion-rutas/asignacion-rutas.module').then((m) => m.AsignacionRutasModule)
	},
	//Documentos
	{
		path: PATHS_FR_PAGES.devoluciones.onLyPath,
		loadChildren: () => import('../fr/documentos/devoluciones/devoluciones.module').then((m) => m.DevolucionesModule)
	},
	{
		path: PATHS_FR_PAGES.aprobarDevolucion.onLyPath,
		loadChildren: () => import('../fr/documentos/aprobar-devolucion/aprobar-devolucion.module').then((m) => m.AprobarDevolucionModule)
	},
	//Reportes
	{
		path: PATHS_FR_PAGES.documentosNoCargados.onLyPath,
		loadChildren: () => import('../fr/reportes/documentos-no-cargados/documentos-no-cargados.module').then((m) => m.DocumentosNoCargadosModule)
	},
	{
		path: PATHS_FR_PAGES.bitacoraSincronizacion.onLyPath,
		loadChildren: () => import('../fr/reportes/bitacora-sincronizacion/bitacora-sincronizacion.module').then((m) => m.BitacoraSincronizacionModule)
	},
	{
		path: PATHS_FR_PAGES.clientesAbandono.onLyPath,
		loadChildren: () => import('../fr/reportes/clientes-abandono/clientes-abandono.module').then((m) => m.ClientesAbandonoModule)
	},
	{
		path: PATHS_FR_PAGES.historicoVisitas.onLyPath,
		loadChildren: () => import('../fr/reportes/historico-visitas/historico-visitas.module').then((m) => m.HistoricoVisitasModule)
	},
	{
		path: PATHS_FR_PAGES.ventasConsignacion.onLyPath,
		loadChildren: () => import('../fr/reportes/ventas-consignacion/ventas-consignacion.module').then((m) => m.VentasConsignacionModule)
	},
	{
		path: PATHS_FR_PAGES.documentosGeneradosFr.onLyPath,
		loadChildren: () => import('../fr/reportes/documentos-generados-fr/documentos-generados-fr.module').then((m) => m.DocumentosGeneradosFrModule)
	},
	{
		path: PATHS_FR_PAGES.liquidacionAgentes.onLyPath,
		loadChildren: () => import('../fr/reportes/liquidacion-agentes/liquidacion-agentes.module').then((m) => m.LiquidacionAgentesModule)
	},
	{
		path: PATHS_FR_PAGES.visitasDia.onLyPath,
		loadChildren: () => import('../fr/reportes/visitas-dia/visitas-dia.module').then((m) => m.VisitasDiaModule)
	},
	{
		path: PATHS_FR_PAGES.ubicacionesVisita.onLyPath,
		loadChildren: () => import('../fr/reportes/ubicaciones-visita/ubicaciones-visita.module').then((m) => m.UbicacionesVisitaModule)
	},
	//Procesos
	{
		path: PATHS_FR_PAGES.cargaClientes.onLyPath,
		loadChildren: () => import('../fr/procesos/carga-clientes/carga-clientes.module').then((m) => m.CargaClientesModule)
	},
	{
		path: PATHS_FR_PAGES.cargaArticulos.onLyPath,
		loadChildren: () => import('../fr/procesos/carga-articulos/carga-articulos.module').then((m) => m.CargaArticulosModule)
	},
	{
		path: PATHS_FR_PAGES.cargaBodegas.onLyPath,
		loadChildren: () => import('../fr/procesos/carga-bodegas/carga-bodegas.module').then((m) => m.CargaBodegasModule)
	},
	{
		path: PATHS_FR_PAGES.cargaHandheld.onLyPath,
		loadChildren: () => import('../fr/procesos/carga-handheld/carga-handheld.module').then((m) => m.CargaHandheldModule)
	},
	{
		path: PATHS_FR_PAGES.cargaErp.onLyPath,
		loadChildren: () => import('../fr/procesos/carga-erp/carga-erp.module').then((m) => m.CargaErpModule)
	},
	{
		path: PATHS_FR_PAGES.configuracionHH.onLyPath,
		loadChildren: () => import('../fr/procesos/configuracion-hh/configuracion-hh.module').then((m) => m.ConfiguracionHhModule)
	},
	{
		path: PATHS_FR_PAGES.cargaUbicacionesClientes.onLyPath,
		loadChildren: () => import('../fr/procesos/carga-ubicaciones-clientes/carga-ubicaciones-clientes.module').then((m) => m.CargaUbicacionesClientesModule)
	},
	{
		path: PATHS_FR_PAGES.cierreJornada.onLyPath,
		loadChildren: () => import('../fr/procesos/cierre-jornada/cierre-jornada.module').then((m) => m.CierreJornadaModule)
	},
	//Administracion
	{
		path: PATHS_FR_PAGES.handhelds.onLyPath,
		loadChildren: () => import('../fr/administracion/handhelds/handhelds.module').then((m) => m.HandheldsModule)
	},
	{
		path: PATHS_FR_PAGES.clientes.onLyPath,
		loadChildren: () => import('../fr/administracion/clientes/clientes.module').then((m) => m.ClientesModule)
	},
	{
		path: PATHS_FR_PAGES.articulos.onLyPath,
		loadChildren: () => import('../fr/administracion/articulos/articulos.module').then((m) => m.ArticulosModule)
	},
	{
		path: PATHS_FR_PAGES.gruposArticulos.onLyPath,
		loadChildren: () => import('../fr/administracion/grupos-articulos/grupos-articulos.module').then((m) => m.GruposArticulosModule)
	},
	{
		path: PATHS_FR_PAGES.visitas.onLyPath,
		loadChildren: () => import('../fr/administracion/visitas/visitas.module').then((m) => m.VisitasModule)
	},
	{
		path: PATHS_FR_PAGES.razonesVisita.onLyPath,
		loadChildren: () => import('../fr/administracion/razones-visita/razones-visita.module').then((m) => m.RazonesVisitaModule)
	},
	{
		path: PATHS_FR_PAGES.sugeridosVenta.onLyPath,
		loadChildren: () => import('../fr/administracion/sugeridos-venta/sugeridos-venta.module').then((m) => m.SugeridosVentaModule)
	},
	{
		path: PATHS_FR_PAGES.asignacionSugeridosVenta.onLyPath,
		loadChildren: () => import('../fr/administracion/asignacion-sugeridos-venta/asignacion-sugeridos-venta.module').then((m) => m.AsignacionSugeridosVentaModule)
	},
	{
		path: PATHS_FR_PAGES.bodegas.onLyPath,
		loadChildren: () => import('../fr/administracion/bodegas/bodegas.module').then((m) => m.BodegasModule)
	},
	{
		path: PATHS_FR_PAGES.agentes.onLyPath,
		loadChildren: () => import('../fr/administracion/agentes/agentes.module').then((m) => m.AgentesModule)
	},
	{
		path: PATHS_FR_PAGES.emm.onLyPath,
		loadChildren: () => import('../fr/administracion/emm/emm.module').then((m) => m.EmmModule)
	},
	{
		path: PATHS_FR_PAGES.controlArchivosActualizaciones.onLyPath,
		loadChildren: () => import('../fr/administracion/control-archivos-actualizaciones/control-archivos-actualizaciones.module').then((m) => m.ControlArchivosActualizacionesModule)
	},
	{
		path: PATHS_FR_PAGES.monitoreoDocumentos.onLyPath,
		loadChildren: () => import('../fr/administracion/monitoreo-documentos/monitoreo-documentos.module').then((m) => m.MonitoreoDocumentosModule)
	},
	{
		path: PATHS_FR_PAGES.parametrosModulo.onLyPath,
		loadChildren: () => import('../fr/administracion/parametros-modulo/parametros-modulo.module').then((m) => m.ParametrosModuloModule)
	},
	{
		path: PATHS_FR_PAGES.dashboardGeneral.onLyPath,
		loadChildren: () => import('../fr/administracion/dashboard-general/dashboard-general.module').then((m) => m.DashboardGeneralModule)
	},
	{
		path: PATHS_FR_PAGES.metasVentaCobro.onLyPath,
		loadChildren: () => import('../fr/administracion/metas-venta-cobro/metas-venta-cobro.module').then((m) => m.MetasVentaCobroModule)
	},
	//Acerca de
	{
		path: PATHS_FR_PAGES.acercaDe.onLyPath,
		loadChildren: () => import('../fr/acerca-de/acerca-de.module').then((m) => m.AcercaDeModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class FrRoutingModule {}
