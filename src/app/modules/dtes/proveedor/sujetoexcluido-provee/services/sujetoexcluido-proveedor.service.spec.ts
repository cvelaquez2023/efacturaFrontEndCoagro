import { TestBed } from '@angular/core/testing';

import { SujetoexcluidoProveedorService } from './sujetoexcluido-proveedor.service';

describe('SujetoexcluidoProveedorService', () => {
	let service: SujetoexcluidoProveedorService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(SujetoexcluidoProveedorService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
