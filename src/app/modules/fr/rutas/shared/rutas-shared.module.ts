import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { F1SelectorComponent } from './f1-selector/f1-selector.component';

@NgModule({
	declarations: [F1SelectorComponent],
	imports: [CommonModule, FormsModule, ReactiveFormsModule, AngularMaterialModule],
	exports: [CommonModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, F1SelectorComponent]
})
export class RutasSharedModule {}
