import { loadCondicionPagoAccion } from './../../modules/as/tablas/tipos/condcion-pago/store/condicionPago.actions';
/* eslint-disable ngrx/avoid-dispatching-multiple-actions-sequentially */

import { Observable } from 'rxjs';
import { loadGlobalesAS } from './../../modules/as/strore/as.actions';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
	selector: 'app-default',
	templateUrl: './default.component.html',
	styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
	constructor(private store: Store<any>) {}
	globalesAS$: Observable<any> = new Observable();
	ngOnInit(): void {
		// eslint-disable-next-line ngrx/avoid-dispatching-multiple-actions-sequentially
		//this.store.dispatch(loadGlobalesAS());
		//this.store.dispatch(loadCondicionPagoAccion());
		this.globalesAS$.subscribe((respo) => {
			console.log('globales', respo);
		});
	}

	sideBarOpen = true;
	sideBarToggler(): void {
		this.sideBarOpen = !this.sideBarOpen;
	}
}
