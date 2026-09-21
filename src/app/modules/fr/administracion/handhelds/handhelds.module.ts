import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { HandheldsRoutingModule } from "./handhelds-routing.module";
import { HandheldsPageComponent } from "./pages/handhelds-page/handhelds-page.component";
import { AddHandheldComponent } from "./pages/add-handheld/add-handheld.component";

@NgModule({
  declarations: [HandheldsPageComponent, AddHandheldComponent],
  imports: [
    CommonModule,
    HandheldsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class HandheldsModule {}
