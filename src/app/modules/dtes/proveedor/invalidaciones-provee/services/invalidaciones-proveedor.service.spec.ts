import { TestBed } from '@angular/core/testing';

import { InvalidacionesProveedorService } from './invalidaciones-proveedor.service';

describe('InvalidacionesProveedorService', () => {
	let service: InvalidacionesProveedorService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(InvalidacionesProveedorService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
