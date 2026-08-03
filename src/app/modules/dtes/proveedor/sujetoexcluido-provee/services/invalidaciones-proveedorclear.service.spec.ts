import { TestBed } from '@angular/core/testing';

import { InvalidacionesProveedorclearService } from './invalidaciones-proveedorclear.service';

describe('InvalidacionesProveedorclearService', () => {
	let service: InvalidacionesProveedorclearService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(InvalidacionesProveedorclearService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
