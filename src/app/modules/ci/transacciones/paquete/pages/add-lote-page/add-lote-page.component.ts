import { SnotifyModule } from 'ng-snotify';
import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-add-lote-page',
	templateUrl: './add-lote-page.component.html',
	styleUrls: ['./add-lote-page.component.scss']
})
export class AddLotePageComponent implements OnInit {
	constructor(private _snotifyModule: SnotifyModule) {}

	ngOnInit(): void {
		console.log('aqui pondremos lote');
	}
}
