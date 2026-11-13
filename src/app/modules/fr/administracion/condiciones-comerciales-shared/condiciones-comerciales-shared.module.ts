import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { BuscadorErpComponent } from "./buscador-erp/buscador-erp.component";

@NgModule({
  declarations: [BuscadorErpComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AngularMaterialModule],
  exports: [BuscadorErpComponent],
})
export class CondicionesComercialesSharedModule {}
