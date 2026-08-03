import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContingenciaRoutingModule } from './contingencia-routing.module';
import { ListarPagesComponent } from './pages/listar-pages/listar-pages.component';
import { ListaContigenciarPagesComponent } from './pages/lista-contigenciar-pages/lista-contigenciar-pages.component';

@NgModule({
	declarations: [ListarPagesComponent, ListaContigenciarPagesComponent],
	imports: [CommonModule, ContingenciaRoutingModule]
})
export class ContingenciaModule {}
