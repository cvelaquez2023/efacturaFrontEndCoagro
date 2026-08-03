import { TestBed } from '@angular/core/testing';

import { ClienteDteApiService } from './cliente-dte-api.service';

describe('ClienteDteApiService', () => {
	let service: ClienteDteApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ClienteDteApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
