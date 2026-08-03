import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Iglobales_AS } from '../../model/Globales_AS.interface';

@Injectable({
	providedIn: 'root'
})
export class ChanelGlobalesASService {
	private globaleASSource = new Subject<Iglobales_AS>();
	chanelGlobalesAS$ = this.globaleASSource.asObservable();
	showGlobalesAS(show: Iglobales_AS): void {
		this.globaleASSource.next(show);
	}
}
