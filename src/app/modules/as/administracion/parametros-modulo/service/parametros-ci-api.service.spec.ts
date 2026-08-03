import { TestBed } from '@angular/core/testing';

import { ParametrosASApiService } from './parametros-as-api.service';

describe('ParametrosCiApiService', () => {
	let service: ParametrosASApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ParametrosASApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
