import { TestBed } from '@angular/core/testing';

import { GlobalesCIApiService } from './globales-ci-api.service';

describe('GlobalesCIApiService', () => {
	let service: GlobalesCIApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(GlobalesCIApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
