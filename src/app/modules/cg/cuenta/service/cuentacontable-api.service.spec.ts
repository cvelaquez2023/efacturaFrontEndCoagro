import { TestBed } from '@angular/core/testing';

import { CuentacontableApiService } from './cuentacontable-api.service';

describe('CuentacontableApiService', () => {
	let service: CuentacontableApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(CuentacontableApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
