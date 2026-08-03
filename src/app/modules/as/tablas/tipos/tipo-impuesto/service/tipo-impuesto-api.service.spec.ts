import { TestBed } from '@angular/core/testing';

import { TipoImpuestoApiService } from './tipo-impuesto-api.service';

describe('TipoImpuestoApiService', () => {
	let service: TipoImpuestoApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(TipoImpuestoApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
