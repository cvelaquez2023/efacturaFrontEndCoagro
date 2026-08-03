import { TestBed } from '@angular/core/testing';

import { TipoAnulacionApiService } from './tipo-anulacion-api.service';

describe('TipoAnulacionApiService', () => {
	let service: TipoAnulacionApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(TipoAnulacionApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
