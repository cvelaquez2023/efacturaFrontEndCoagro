import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PATHS_METAS_PAGES } from "@app/config/path-page-metas";
import { AuthGuard } from "@app/guards/auth.guard";
import { ModuloMetasPageComponent } from "./pages/modulo-metas-page/modulo-metas-page.component";

const routes: Routes = [
  {
    path: "",
    component: ModuloMetasPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: PATHS_METAS_PAGES.metas.onLyPath,
    loadChildren: () => import("./metas/metas.module").then((m) => m.MetasModule),
  },
  {
    path: PATHS_METAS_PAGES.lineasNegocio.onLyPath,
    loadChildren: () => import("./lineas-negocio/lineas-negocio.module").then((m) => m.LineasNegocioModule),
  },
  // Cuadro de Control
  {
    path: PATHS_METAS_PAGES.incentivoMetas.onLyPath,
    loadChildren: () =>
      import("./cuadro-control/incentivo-metas/incentivo-metas.module").then((m) => m.IncentivoMetasModule),
  },
  {
    path: PATHS_METAS_PAGES.ventasDiarias.onLyPath,
    loadChildren: () =>
      import("./cuadro-control/ventas-diarias/ventas-diarias.module").then((m) => m.VentasDiariasModule),
  },
  {
    path: PATHS_METAS_PAGES.dashboard.onLyPath,
    loadChildren: () => import("./cuadro-control/dashboard/dashboard.module").then((m) => m.DashboardModule),
  },
  {
    path: PATHS_METAS_PAGES.lideres.onLyPath,
    loadChildren: () => import("./lideres/lideres.module").then((m) => m.LideresModule),
  },
  {
    path: PATHS_METAS_PAGES.proveedores.onLyPath,
    loadChildren: () => import("./proveedores/proveedores.module").then((m) => m.ProveedoresModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModuloMetasRoutingModule {}
