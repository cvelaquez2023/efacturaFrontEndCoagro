import { AngularMaterialModule } from "./../../../angular-material-modulo";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ArticuloRoutingModule } from "./articulo-routing.module";
import { ArticuloPageComponent } from "./pages/articulo-page/articulo-page.component";
import { AddArticuloPageComponent } from "./pages/add-articulo-page/add-articulo-page.component";
import { AddArticuloBodegaPageComponent } from "./pages/add-articulo-bodega-page/add-articulo-bodega-page.component";
import { TipoDocPipe } from "./pipe/TipoDocPipe";
import { EstadoPipe } from "./pipe/EstadoPipe";
import { CargaArchivoPageComponent } from "./pages/carga-archivo-page/carga-archivo-page.component";
import { EditarDtePageComponent } from "./pages/editar-dte-page/editar-dte-page.component";
import { AplicarCPPageComponent } from "./pages/aplicar-cppage/aplicar-cppage.component";
import { AplicarCbPageComponent } from "./pages/aplicar-cb-page/aplicar-cb-page.component";
import { AplicarCpPageComponent } from "./pages/aplicar-cp-page/aplicar-cp-page.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CurrencyMaskModule } from "ng2-currency-mask";
import { PartidaContableComponent } from "./pages/partida-contable/partida-contable.component";
import { CurrencyPipe } from "@angular/common";
import { AddLineaAsientosComponent } from "./pages/add-linea-asientos/add-linea-asientos.component";
import { AplicarCb2PageComponent } from "./pages/aplicar-cb2-page/aplicar-cb2-page.component";

@NgModule({
  declarations: [
    ArticuloPageComponent,
    AddArticuloPageComponent,
    AddArticuloBodegaPageComponent,
    TipoDocPipe,
    EstadoPipe,
    CargaArchivoPageComponent,
    EditarDtePageComponent,
    AplicarCPPageComponent,
    AplicarCbPageComponent,
    AplicarCpPageComponent,
    PartidaContableComponent,
    AddLineaAsientosComponent,
    AplicarCb2PageComponent,
  ],
  imports: [
    CommonModule,
    ArticuloRoutingModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MatFormFieldModule,
    MatInputModule,
    CurrencyMaskModule,
  ],
  providers: [CurrencyPipe],
})
export class ArticuloModule {}
