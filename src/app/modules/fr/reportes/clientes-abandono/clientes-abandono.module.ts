import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { ClientesAbandonoRoutingModule } from "./clientes-abandono-routing.module";
import { ClientesAbandonoPageComponent } from "./pages/clientes-abandono-page/clientes-abandono-page.component";

@NgModule({
  declarations: [ClientesAbandonoPageComponent],
  imports: [
    CommonModule,
    ClientesAbandonoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class ClientesAbandonoModule {}
