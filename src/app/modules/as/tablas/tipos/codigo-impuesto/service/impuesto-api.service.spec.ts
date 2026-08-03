/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ImpuestoApiService } from './impuesto-api.service';

describe('Service: ImpuestoApi', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ImpuestoApiService]
		});
	});

	it('should ...', inject([ImpuestoApiService], (service: ImpuestoApiService) => {
		expect(service).toBeTruthy();
	}));
});
