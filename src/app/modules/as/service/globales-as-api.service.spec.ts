import { TestBed } from '@angular/core/testing';

import { GlobalesASApiService } from './globales-as-api.service';

describe('GlobalesASApiService', () => {
	let service: GlobalesASApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(GlobalesASApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
