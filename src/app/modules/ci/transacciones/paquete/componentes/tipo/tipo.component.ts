import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-tipo',
	templateUrl: './tipo.component.html',
	styleUrls: ['./tipo.component.scss']
})
export class TipoComponent {
	// eslint-disable-next-line @angular-eslint/no-input-rename
	@Input('data') ajuste: any;
}
