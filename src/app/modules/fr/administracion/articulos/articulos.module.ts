import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { ArticulosRoutingModule } from "./articulos-routing.module";
import { ArticulosPageComponent } from "./pages/articulos-page/articulos-page.component";
import { AddArticuloFrComponent } from "./pages/add-articulo-fr/add-articulo-fr.component";

@NgModule({
  declarations: [ArticulosPageComponent, AddArticuloFrComponent],
  imports: [
    CommonModule,
    ArticulosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class ArticulosModule {}
