import { TestBed } from '@angular/core/testing';

import { CtaProveedorApiService } from './cta-proveedor-api.service';

describe('CtaProveedorApiService', () => {
	let service: CtaProveedorApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(CtaProveedorApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
