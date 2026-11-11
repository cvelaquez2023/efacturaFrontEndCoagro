import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { CatalogoCrudComponent } from "./catalogo-crud/catalogo-crud.component";
import { CatalogoDialogComponent } from "./catalogo-dialog/catalogo-dialog.component";

/** Piezas compartidas por Metas, Líderes y Proveedores. */
@NgModule({
  declarations: [CatalogoCrudComponent, CatalogoDialogComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AngularMaterialModule],
  exports: [CatalogoCrudComponent],
})
export class MetasSharedModule {}
