import { TestBed } from '@angular/core/testing';

import { MonedaApiService } from './moneda-api.service';

describe('MonedaApiService', () => {
	let service: MonedaApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(MonedaApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
