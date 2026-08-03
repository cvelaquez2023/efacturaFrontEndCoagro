import { TestBed } from '@angular/core/testing';

import { ClasificacionApiService } from './clasificacion-api.service';

describe('ClasificacionApiService', () => {
	let service: ClasificacionApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ClasificacionApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
