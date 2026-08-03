/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ConsecutivoApiService } from './consecutivo-api.service';

describe('Service: ConsecutivoApi', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ConsecutivoApiService]
		});
	});

	it('should ...', inject([ConsecutivoApiService], (service: ConsecutivoApiService) => {
		expect(service).toBeTruthy();
	}));
});
