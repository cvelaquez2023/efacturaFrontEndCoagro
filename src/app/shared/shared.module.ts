import { HighchartsChartModule } from 'highcharts-angular';
import { AreaComponent } from './../modules/home/widgets/area/area/area.component';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from './../angular-material-modulo';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { TreeComponent } from './components/tree/tree.component';
import { TreeCiComponent } from './components/tree/ci/tree-ci/tree-ci.component';
import { SeparadorDirective } from './directivas/separador.directive';
import { NumberOnlyDirective } from './directivas/number-only.directive';
import { TreeCgComponent } from './components/tree/cg/tree-cg/tree-cg.component';
import { CuentaTipoPipe } from './pipe/cuenta-tipo.pipe';
import { TreeClienteComponent } from './components/tree/cliente/tree-cliente/tree-cliente.component';
import { TreeProveedorComponent } from './components/tree/proveedore/tree-proveedor/tree-proveedor.component';
import { TreeDteComponent } from './components/tree/dte/tree-dte/tree-dte.component';
import { TreeUsuarioComponent } from './components/tree/usuarios/tree-usuario/tree-usuario.component';

@NgModule({
	declarations: [
		AreaComponent,
		HeaderComponent,
		FooterComponent,
		SidebarComponent,
		TreeComponent,
		TreeCiComponent,
		TreeCgComponent,
		SeparadorDirective,
		CuentaTipoPipe,
		TreeClienteComponent,
		TreeProveedorComponent,
		TreeDteComponent,
		TreeUsuarioComponent
	],
	imports: [
		MatListModule,
		MatMenuModule,
		CommonModule,
		MatDividerModule,
		MatToolbarModule,
		MatIconModule,
		MatButtonModule,
		MatExpansionModule,
		FlexLayoutModule,
		AngularMaterialModule,
		RouterModule,
		HighchartsChartModule
	],
	exports: [HeaderComponent, FooterComponent, SidebarComponent, AreaComponent]
})
export class SharedModule {}
